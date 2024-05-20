# Standard library imports
import datetime

# Django imports
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.db.models import BooleanField, Q, Case, When, Value, Prefetch
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse

# Local application imports
from .models import Giocatore, Match, Set, Game, Point, Tiebreak, TiebreakPoint, MatchStat

def suggest_player(request):
    term = request.GET.get('term', '')  # Recupera il termine di ricerca dall'URL
    if term:
        giocatori = Giocatore.objects.filter(player__icontains=term)  # Filtra i giocatori in base al termine di ricerca
        giocatori_list = list(giocatori.values_list('player', flat=True))
        return JsonResponse(giocatori_list, safe=False)  # Restituisce l'elenco dei nomi dei giocatori come JSON
    return JsonResponse([], safe=False)  # Restituisce un elenco vuoto se non c'è un termine di ricerca

def homepage(request):
    query = request.GET.get('q', '')  # Ottiene il parametro di ricerca dall'URL, se presente
    if query:
        giocatori = Giocatore.objects.filter(player__icontains=query)  # Filtra i giocatori in base al termine di ricerca
    else:
        giocatori = Giocatore.objects.all()  # Altrimenti mostra tutti i giocatori

    return render(request, 'homepage.html', {'giocatori': giocatori, 'query': query})


def matches_today(request):
    date = request.GET.get('date')
    player = request.GET.get('player')
    matches = Match.objects.all()

    if date:
        try:
            date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
            matches = matches.filter(event_date=date)
        except ValueError:
            messages.error(request, "Formato data non valido. Inserisci una data nel formato YYYY-MM-DD.")
            return redirect('matches_today')

    if player:
        matches = matches.filter(Q(event_first_player__icontains=player) | Q(event_second_player__icontains=player))

    tournaments = {}
    for match in matches:
        if match.tournament_name not in tournaments:
            tournaments[match.tournament_name] = []
        tournaments[match.tournament_name].append(match)

    return render(request, 'matches_today.html', {'tournaments': tournaments})

def match_details(request, match_id):
    match = get_object_or_404(Match, pk=match_id)
    if ' - ' in match.event_final_result:
        first_score, second_score = match.event_final_result.split(' - ')
    else:
        first_score = second_score = 0

    sets = match.sets.prefetch_related('games__points', 'tiebreak__points').all()
    stats = MatchStat.objects.filter(match=match).select_related('player')

    organized_stats = {}
    for stat in stats:
        if stat.stat_name not in organized_stats:
            organized_stats[stat.stat_name] = {}
        player_key = stat.player.player
        if player_key not in organized_stats[stat.stat_name]:
            organized_stats[stat.stat_name][player_key] = {'value': 0, 'won': 0, 'total': 0}
        organized_stats[stat.stat_name][player_key]['value'] = stat.stat_value
        organized_stats[stat.stat_name][player_key]['won'] = stat.stat_won if stat.stat_won else 0
        organized_stats[stat.stat_name][player_key]['total'] = stat.stat_total if stat.stat_total else 0

    details = []
    for set in sets:
        games = set.games.all()
        game_details = [{'game': game, 'points': game.points.all(), 'is_break': game.is_break()} for game in games]
        tiebreak = set.tiebreak if hasattr(set, 'tiebreak') else None
        tiebreak_points = tiebreak.points.all() if tiebreak else []
        details.append({'set': set, 'games': game_details, 'tiebreak': tiebreak, 'tiebreak_points': tiebreak_points})

    context = {
        'match': match,
        'details': details,
        'stats': organized_stats,
        'first_score': first_score,
        'second_score': second_score
    }

    return render(request, 'match_details.html', context)


from .utils import invert_match_result  # Assicurati di importare la funzione correttamente

def dettagli_giocatore(request, player_key):
    num_matches = request.GET.get('num_matches', None)
    giocatore = get_object_or_404(Giocatore, player_key=player_key)

    # Filtro per includere solo i match con "event_status" desiderati
    desired_statuses = ['Finished', 'Retired']
    matches_query = Match.objects.filter(
        (Q(first_player_key=giocatore) | Q(second_player_key=giocatore)) & 
        Q(event_status__in=desired_statuses)
    ).select_related('tournament_key').prefetch_related(
        'sets__games', 'sets__tiebreak'
    ).order_by('-event_date').annotate(
        is_second_player=Case(
            When(second_player_key=giocatore, then=Value(True)),
            default=Value(False),
            output_field=BooleanField()
        )
    )

    matches = [invert_match_result(match) for match in matches_query]

    if num_matches:
        matches = matches[:int(num_matches)]

    return render(request, 'dettagli_giocatore.html', {'giocatore': giocatore, 'matches': matches})



from .utils import invert_match_data 

def match_details_json(request, match_id):
    player_key = request.GET.get('player_key')  # Ottiene il player_key dalla query string
    try:
        match = get_object_or_404(Match, pk=match_id)
        is_second_player = match.second_player_key.player_key == player_key  # Determina il ruolo del giocatore

        sets = match.sets.all().prefetch_related(
            Prefetch('games__points'),
            Prefetch('tiebreak__points')
        )

        # Organizzazione dei dati
        data = organize_match_data(sets, match)  # Passa anche match alla funzione

        # Inverti i dati se il giocatore è il secondo giocatore
        if is_second_player:
            data = invert_match_data(data)  # Inverti i dati utilizzando la funzione helper definita in utils.py

        return JsonResponse(data)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Match not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def organize_match_data(sets, match):
    sets_data = []
    for set in sets:
        games_data = []
        for game in set.games.all():
            points_data = [{
                'point_number': point.number_point,
                'game_score': point.game_score,
                'break_point': point.break_point,
                'point_winner': point.point_winner  
            } for point in game.points.all()]
            games_data.append({
                'game_number': game.number_game,
                'game_winner': game.game_winner,
                'score': game.set_score,
                'player_served': game.player_served,
                'serve_lost': game.serve_lost,
                'is_break': game.is_break(),
                'points': points_data
            })
        tiebreak_data = {
            'score_first_player': set.tiebreak.score_first_player,
            'score_second_player': set.tiebreak.score_second_player,
            'points': [{
                'point_number': point.point_number,
                'player_served': point.player_served,
                'point_winner': point.point_winner,  
                'serve_lost': point.serve_lost,
                'score': point.score,
                'is_mini_break': point.is_mini_break()
            } for point in set.tiebreak.points.all()]
        } if hasattr(set, 'tiebreak') else None
        sets_data.append({'set_number': set.score_set, 'games': games_data, 'tiebreak': tiebreak_data})

    # Recupero delle statistiche dei giocatori per il match
    player_stats = {}
    stats = match.stats.all().select_related('player')
    for stat in stats:
        player_key = stat.player.player_key
        if player_key not in player_stats:
            player_stats[player_key] = []
        player_stats[player_key].append({
            'stat_period': stat.stat_period,
            'stat_type': stat.stat_type,
            'stat_name': stat.stat_name,
            'stat_value': stat.stat_value,
            'stat_won': stat.stat_won,
            'stat_total': stat.stat_total
        })

    return {'sets': sets_data, 'player_statistics': player_stats}

import json
from django.core.management.base import BaseCommand, CommandError
from django.utils.dateparse import parse_date, parse_time
from tennisxchange.models import Match, Giocatore, Torneo, Set, Game, Point, Tiebreak, TiebreakPoint, MatchStat

class Command(BaseCommand):
    help = 'Importa i match, i set, i giochi, i punti, i tiebreak e le statistiche dei match da un file JSON'

    def handle(self, *args, **options):
        try:
            with open('C:/Users/samue/OneDrive/Desktop/project/txc/fixtures.json', 'r') as file:
                data = json.load(file)
                
                for event_type_key, events in data.items():
                    self.stdout.write(self.style.SUCCESS(f'Processing events under key: {event_type_key}'))
                    for entry in events:
                        self.stdout.write(self.style.SUCCESS(f'Processing entry: {entry["event_key"]}'))

                        # Crea o aggiorna il Torneo
                        torneo, _ = Torneo.objects.get_or_create(
                            tournament_key=entry['tournament_key'],
                            defaults={
                                'nome': entry['tournament_name'],
                                'tipo_evento': entry['event_type_type'],
                                'superficie': entry.get('surface', '')
                            }
                        )
                        
                        # Crea o aggiorna i Giocatori
                        first_player, _ = Giocatore.objects.get_or_create(
                            player_key=entry['first_player_key'],
                            defaults={'player': entry['event_first_player']}
                        )
                        second_player, _ = Giocatore.objects.get_or_create(
                            player_key=entry['second_player_key'],
                            defaults={'player': entry['event_second_player']}
                        )
                        
                        # Crea o aggiorna il Match
                        match, _ = Match.objects.update_or_create(
                            event_key=entry['event_key'],
                            defaults={
                                'event_date': parse_date(entry['event_date']),
                                'event_time': parse_time(entry['event_time']) if entry['event_time'] else None,
                                'event_first_player': entry['event_first_player'],
                                'first_player_key': first_player,
                                'event_second_player': entry['event_second_player'],
                                'second_player_key': second_player,
                                'event_final_result': entry['event_final_result'],
                                'event_winner': entry['event_winner'],
                                'event_status': entry['event_status'],
                                'event_type_type': entry['event_type_type'],
                                'tournament_name': entry['tournament_name'],
                                'tournament_key': torneo,
                                'tournament_round': entry['tournament_round'],
                                'tournament_season': entry['tournament_season'],
                                'event_live': entry['event_live'],
                                'event_qualification': entry['event_qualification'],
                            }
                        )
                        
                        # Gestione delle statistiche del match
                        for stat in entry.get('statistics', []):
                            try:
                                player = Giocatore.objects.get(player_key=stat['player_key'])
                                MatchStat.objects.update_or_create(
                                    match=match,
                                    player=player,
                                    stat_name=stat['stat_name'],
                                    stat_period=stat.get('stat_period', 'match'),
                                    defaults={
                                        'stat_type': stat['stat_type'],
                                        'stat_value': stat['stat_value'],
                                        'stat_won': stat.get('stat_won'),
                                        'stat_total': stat.get('stat_total')
                                    }
                                )
                            except Giocatore.DoesNotExist:
                                self.stdout.write(self.style.WARNING(f"Giocatore con chiave {stat['player_key']} non trovato. Statistiche non inserite."))


                        # Gestione dei Set e dei Game
                        set_map = {}
                        for set_info in entry['scores']:
                            set_instance, created = Set.objects.update_or_create(
                                match=match,
                                score_set=set_info['score_set'],
                                defaults={
                                    'score_first': set_info['score_first'],
                                    'score_second': set_info['score_second']
                                }
                            )
                            set_map[set_info['score_set']] = set_instance

                        # Gestione dei Game e dei Tiebreak
                        for game_info in entry['pointbypoint']:
                            game_set_number = str(game_info['set_number'])
                            if game_set_number in set_map:
                                if 'tb_point_number' in game_info:
                                    # Gestione dei Tiebreak
                                    tiebreak, created = Tiebreak.objects.update_or_create(
                                        set=set_map[game_set_number],
                                        defaults={
                                            'score_first_player': game_info['tb_score'].split(' - ')[0],
                                            'score_second_player': game_info['tb_score'].split(' - ')[1],
                                        }
                                    )
                                    TiebreakPoint.objects.update_or_create(
                                        tiebreak=tiebreak,
                                        point_number=int(game_info['tb_point_number']),
                                        defaults={
                                            'player_served': game_info['tb_player_served'],
                                            'point_winner': game_info['tb_point_winner'],
                                            'serve_lost': game_info.get('tb_serve_lost'),
                                            'score': game_info['tb_score']
                                        }
                                    )
                                else:
                                    # Gestione dei Game normali
                                    game_number = game_info.get('number_game')
                                    if game_number and int(game_number) != 13:
                                        game, created = Game.objects.update_or_create(
                                            set=set_map[game_set_number],
                                            number_game=game_number,
                                            defaults={
                                                'player_served': game_info['player_served'],
                                                'serve_lost': game_info.get('serve_lost'),
                                                'game_winner': game_info['game_winner'],
                                                'set_score': game_info['set_score']
                                            }
                                        )
                                        # Gestione dei Point
                                        for point_info in game_info.get('points', []):
                                            Point.objects.update_or_create(
                                                game=game,
                                                number_point=int(point_info['number_point']),
                                                defaults={
                                                    'break_point': point_info['break_point'],  # Modifica qui
                                                    'game_score': point_info['game_score']
                                                }
                                            )

                self.stdout.write(self.style.SUCCESS('Importazione completata con successo'))
        except FileNotFoundError:
            raise CommandError('File "fixtures.json" non trovato')
        except Exception as e:
            raise CommandError(f'Errore durante l\'importazione: {str(e)}')
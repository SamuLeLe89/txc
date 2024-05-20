def invert_match_result(match):
    if match.is_second_player:
        # Inversione del risultato del match
        match.event_final_result = ' - '.join(reversed(match.event_final_result.split(' - ')))

        # Inversione dei nomi dei giocatori
        match.event_first_player, match.event_second_player = match.event_second_player, match.event_first_player

        # Inversione dei punteggi dei set
        for set in match.sets.all():
            set.score_first, set.score_second = set.score_second, set.score_first

        # Inversione delle quote del match
        match.home_odds, match.away_odds = match.away_odds, match.home_odds

    return match

def invert_match_data(data):
    # Inversione dei set e dei giochi
    for set_data in data['sets']:
        for game in set_data['games']:
            game['player_served'] = 'Second Player' if game['player_served'] == 'First Player' else 'First Player'
            game['game_winner'] = 'Second Player' if game['game_winner'] == 'First Player' else 'First Player'
            if game.get('serve_lost'):
                game['serve_lost'] = 'Second Player' if game['serve_lost'] == 'First Player' else 'First Player'
            if 'score' in game:
                scores = game['score'].split(' - ')
                game['score'] = ' - '.join(scores[::-1])

            for point in game['points']:
                point['point_winner'] = 'Second Player' if point['point_winner'] == 'First Player' else 'First Player'  # Invertire il vincitore del punto
                point_scores = point['game_score'].split(' - ')
                point['game_score'] = ' - '.join(point_scores[::-1])

        if 'tiebreak' in set_data and set_data['tiebreak']:
            tiebreak = set_data['tiebreak']
            tiebreak['score_first_player'], tiebreak['score_second_player'] = tiebreak['score_second_player'], tiebreak['score_first_player']

            for point in tiebreak['points']:
                point['player_served'] = 'Second Player' if point['player_served'] == 'First Player' else 'First Player'
                point['point_winner'] = 'Second Player' if point['point_winner'] == 'First Player' else 'First Player'  # Invertire il vincitore del punto
                if point.get('serve_lost'):
                    point['serve_lost'] = 'Second Player' if point['serve_lost'] == 'First Player' else 'First Player'
                point_scores = point['score'].split(' - ')
                point['score'] = ' - '.join(point_scores[::-1])

    return data

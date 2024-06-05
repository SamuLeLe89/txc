import json
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
import requests

class Command(BaseCommand):
    help = 'Fetches and processes tennis fixtures data from API'

    def handle(self, *args, **options):
        # API settings
        api_base_url = "https://api.api-tennis.com/tennis/"
        api_key = "c25039f39058094b7984f034bda40084e571a854d4bd4454533206008e8ee4c2"

        # Dates for the API request
        today = datetime.now()
        yesterday = today - timedelta(days=1)
        date_stop = today.strftime('%Y-%m-%d')
        date_start = yesterday.strftime('%Y-%m-%d')

        event_type_keys = ["265"]  # ATP Singles
        fixtures_data = {}

        for event_type_key in event_type_keys:
            fixtures = self.get_fixtures(api_base_url, api_key, event_type_key, date_start, date_stop)
            if fixtures:
                fixtures_data[event_type_key] = [self.process_event_data(event) for event in fixtures]

        formatted_data = json.dumps(fixtures_data, indent=4)

        # Saving the processed data to a JSON file
        with open('fixtures.json', 'w') as f:
            f.write(formatted_data)

    def get_fixtures(self, api_base_url, api_key, event_type_key, date_start, date_stop):
        params = {
            'method': 'get_fixtures',
            'APIkey': api_key,
            'event_type_key': event_type_key,
            'date_start': date_start,
            'date_stop': date_stop,
        }
        response = requests.get(api_base_url, params=params)
        if response.status_code == 200:
            return response.json()['result']
        else:
            self.stdout.write(f"Error: {response.status_code}")
            return None

    def process_event_data(self, event):
        # Processing logic as defined previously
        for game in event.get('pointbypoint', []):
            if 'TieBreak' in game['set_number']:
                game['set_number'] = game['set_number'].replace('Set ', '').replace('TieBreak', '').strip()
                game['tb_point_number'] = game.pop('number_game')
                game['tb_player_served'] = game.pop('player_served')
                game['tb_point_winner'] = game.pop('serve_winner')
                game['tb_serve_lost'] = game.pop('serve_lost', None)
                game['tb_score'] = game.pop('score')
            else:
                game['set_number'] = int(game['set_number'].replace('Set ', ''))
            if 'serve_winner' in game:
                game['game_winner'] = game.pop('serve_winner')
            if 'score' in game:
                game['set_score'] = game.pop('score')
            points = game.get('points', [])
            for point in points:
                if 'score' in point:
                    point['game_score'] = point.pop('score')
                if 'break_point' in point:
                    if point['break_point'] == 'First Play':
                        point['break_point'] = 'yes'
                    elif point['break_point'] is None:
                        point['break_point'] = 'no'
                point.pop('set_point', None)
                point.pop('match_point', None)
        for score in event.get('scores', []):
            if '.' in score['score_first']:
                score['score_first'] = str(int(float(score['score_first'])))
            if '.' in score['score_second']:
                score['score_second'] = str(int(float(score['score_second'])))
        for stat in event.get('statistics', []):
            if 'stat_value' in stat and '%' in stat['stat_value']:
                percent_value = stat['stat_value'].replace('%', '')
                decimal_value = int(percent_value) / 100
                stat['stat_value'] = str(decimal_value)
        return event

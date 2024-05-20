import requests
import json
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand, CommandError

class Command(BaseCommand):
    help = 'Recupera le quote delle partite di tennis dell\'ultimo giorno'

    def handle(self, *args, **options):
        api_base_url = "https://api.api-tennis.com/tennis/"
        api_key = "8cf7617b2e7ac35525b342273a44f3cd607c507c479b7b077553ebd46bb710f0"
        method = 'get_odds'

        today = datetime.now()
        one_week_ago = today - timedelta(days=7)  
        date_stop = today.strftime('%Y-%m-%d')
        date_start = one_week_ago.strftime('%Y-%m-%d')  

        params = {
            'APIkey': api_key,
            'method': method,
            'date_start': date_start,
            'date_stop': date_stop
        }

        response = requests.get(api_base_url, params=params)

        if response.status_code == 200:
            data = response.json()['result']
            self.stdout.write(self.style.SUCCESS('Dati recuperati con successo!'))

            # Salvataggio dei dati in formato leggibile
            with open('odds_1day.json', 'w') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            self.stdout.write(self.style.SUCCESS("Dati salvati nel file 'odds_1day.json' in formato leggibile."))
        else:
            raise CommandError(f"Errore nella chiamata API: {response.status_code}")

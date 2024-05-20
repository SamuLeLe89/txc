from django.core.management.base import BaseCommand
import requests
import json

class Command(BaseCommand):
    help = 'Recupera i tornei da una API esterna e filtra i risultati'

    def handle(self, *args, **kwargs):
        api_base_url = "https://api.api-tennis.com/tennis/"
        api_key = "8cf7617b2e7ac35525b342273a44f3cd607c507c479b7b077553ebd46bb710f0"
        params = {
            'method': 'get_tournaments',
            'APIkey': api_key,
        }
        event_types_to_keep = ["Atp Singles", "Wta Singles", "Challenger Men Singles"]

        response = requests.get(api_base_url, params=params)
        if response.status_code == 200:
            data = response.json()['result']
            filtered_data = [item for item in data if item["event_type_type"] in event_types_to_keep]
            if filtered_data:
                self.stdout.write(self.style.SUCCESS('Dati dei tornei filtrati correttamente.'))
                print(json.dumps(filtered_data, indent=4))
                with open('filtered_tournaments.json', 'w') as f:
                    json.dump(filtered_data, f, indent=4)
                self.stdout.write(self.style.SUCCESS("I dati dei tornei filtrati sono stati salvati nel file 'filtered_tournaments.json'."))
            else:
                self.stdout.write(self.style.WARNING('Nessun dato restituito dall\'API.'))
        else:
            self.stdout.write(self.style.ERROR(f"Errore nella chiamata API: {response.status_code}"))


import requests
import json
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand, CommandError
from tennisxchange.models import Match, Giocatore

class Command(BaseCommand):
    help = 'Recupera le quote delle partite di tennis dell\'ultimo giorno e aggiorna i modelli Match'

    def handle(self, *args, **options):
        api_base_url = "https://api.api-tennis.com/tennis/"
        api_key = "6f15a3d9bcc8d98df56fc98ad62f127d183d162e829e85828f19a5c80004623d"
        method = 'get_odds'

        oggi = datetime.now()
        ieri = oggi - timedelta(days=1)

        date_stop = oggi.strftime('%Y-%m-%d')
        date_start = ieri.strftime('%Y-%m-%d')

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

            # Processa ogni voce nel file JSON
            for event_key, odds_data in data.items():
                try:
                    # Ottieni l'evento corrispondente tramite chiave univoca
                    match = Match.objects.get(event_key=int(event_key))
                    # Aggiorna le quote di "bet365" per il giocatore di casa e quello in trasferta
                    match.home_odds = odds_data["Home/Away"]["Home"]["bet365"]
                    match.away_odds = odds_data["Home/Away"]["Away"]["bet365"]
                    match.save()
                    self.stdout.write(self.style.SUCCESS(f'Quote aggiornate per l\'evento {event_key}'))
                except Match.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'Evento con chiave {event_key} non trovato'))
                except KeyError:
                    self.stdout.write(self.style.ERROR(f'Dati delle quote mancanti o errati per l\'evento {event_key}'))

            self.stdout.write(self.style.SUCCESS('Aggiornamento delle quote completato'))
        else:
            raise CommandError(f"Errore nella chiamata API: {response.status_code}")

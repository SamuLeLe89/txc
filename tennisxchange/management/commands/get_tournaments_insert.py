from django.core.management.base import BaseCommand
from django.db.utils import IntegrityError
from tennisxchange.models import Torneo  # Assicurati che il percorso sia corretto
import requests
import json

class Command(BaseCommand):
    help = 'Recupera i tornei da una API esterna, filtra i risultati e li inserisce nel database'

    def handle(self, *args, **kwargs):
        api_base_url = "https://api.api-tennis.com/tennis/"
        api_key = "6f15a3d9bcc8d98df56fc98ad62f127d183d162e829e85828f19a5c80004623d"
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
                try:
                    for item in filtered_data:
                        torneo, created = Torneo.objects.update_or_create(
                            tournament_key=item['tournament_key'],  # Usa il campo corretto qui
                            defaults={
                                'nome': item['tournament_name'],
                                'tipo_evento': item['event_type_type'],
                                'superficie': item.get('tournament_sourface')  # Correggi il nome del campo qui
                            }
                        )
                        if created:
                            self.stdout.write(self.style.SUCCESS(f"Torneo creato: {torneo.nome}"))
                        else:
                            self.stdout.write(self.style.NOTICE(f"Torneo aggiornato: {torneo.nome}"))
                except IntegrityError as e:
                    self.stdout.write(self.style.ERROR(f"Errore di integrità nel database: {e}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Errore generale: {e}"))
                    print("Dettagli errore:", e)

                self.stdout.write(self.style.SUCCESS("I dati dei tornei sono stati inseriti correttamente nel database."))
            else:
                self.stdout.write(self.style.WARNING('Nessun dato restituito dall\'API.'))
        else:
            self.stdout.write(self.style.ERROR(f"Errore nella chiamata API: {response.status_code}"))

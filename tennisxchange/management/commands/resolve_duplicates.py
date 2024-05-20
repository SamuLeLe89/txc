from django.core.management.base import BaseCommand
from django.db.models import Count
from tennisxchange.models import Giocatore, Match

class Command(BaseCommand):
    help = 'Rimuove i giocatori duplicati che non hanno match associati'

    def handle(self, *args, **options):
        # Trova tutti i giocatori e conta quanti duplicati esistono per ciascun nome
        players = Giocatore.objects.values('player').annotate(key_count=Count('player_key', distinct=True)).filter(key_count__gt=1)

        for player in players:
            # Ottieni tutte le istanze duplicate per ciascun nome di giocatore
            player_instances = Giocatore.objects.filter(player=player['player'])

            # Itera su ciascuna istanza del giocatore
            for instance in player_instances:
                # Conta i match associati a questa istanza del giocatore
                match_count = Match.objects.filter(first_player_key=instance).count() + Match.objects.filter(second_player_key=instance).count()
                
                # Se non ci sono match associati, rimuovi questa istanza
                if match_count == 0:
                    self.stdout.write(f"Removing {instance.player_key} for {instance.player} as it has no associated matches.")
                    instance.delete()
                else:
                    self.stdout.write(f"Keeping {instance.player_key} for {instance.player} as it has associated matches.")
        
        self.stdout.write(self.style.SUCCESS('Completed removing duplicate players with no associated matches.'))

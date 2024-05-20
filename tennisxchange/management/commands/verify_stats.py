# occhio perchè c'è da risolvere dell'altro
from django.core.management.base import BaseCommand
from django.core.exceptions import ValidationError
from tennisxchange.models import Match, MatchStat

class Command(BaseCommand):
    help = 'Verifica l\'integrità delle chiavi dei giocatori nelle statistiche dei match'

    def handle(self, *args, **options):
        matches = Match.objects.all()
        error_count = 0

        for match in matches:
            # Ottenere le statistiche associate al match
            stats = MatchStat.objects.filter(match=match)
            # Ottenere le chiavi dei giocatori del match
            match_player_keys = {match.first_player_key.player_key, match.second_player_key.player_key}

            for stat in stats:
                if stat.player.player_key not in match_player_keys:
                    self.stdout.write(self.style.ERROR(
                        f"Mismatch found in Match {match.id}: Statistic for player {stat.player.player_key} does not match match players."
                    ))
                    error_count += 1

        if error_count == 0:
            self.stdout.write(self.style.SUCCESS('All match statistics are consistent with match player keys.'))
        else:
            self.stdout.write(self.style.WARNING(f'Found {error_count} mismatches in player statistics keys.'))


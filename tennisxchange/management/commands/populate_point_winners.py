from django.core.management.base import BaseCommand
from tennisxchange.models import Point

class Command(BaseCommand):
    help = 'Aggiorna il campo point_winner per i punti esistenti'

    def handle(self, *args, **kwargs):
        points = Point.objects.all()
        for point in points:
            point.determine_point_winner()
            point.save()
        self.stdout.write(self.style.SUCCESS('Successfully updated point winners for all points'))

from django.db import models
from django.core.exceptions import ValidationError

class Giocatore(models.Model):
    player = models.CharField(max_length=100, verbose_name="Nome del giocatore")
    player_key = models.CharField(max_length=50, unique=True, verbose_name="Chiave univoca del giocatore")

    def __str__(self):
        return self.player

class Torneo(models.Model):
    tournament_key = models.IntegerField(primary_key=True)
    nome = models.CharField(max_length=100)
    tipo_evento = models.CharField(max_length=50)
    superficie = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.nome} - {self.tipo_evento} ({self.superficie})"

class MatchManager(models.Manager):
    def matches_today(self):
        return self.filter(event_date=timezone.now().date())

class Match(models.Model):
    event_key = models.IntegerField(unique=True, verbose_name="Chiave univoca dell'evento")
    event_date = models.DateField(verbose_name="Data dell'evento")
    event_time = models.TimeField(null=True, blank=True, verbose_name="Ora dell'evento")
    event_first_player = models.CharField(max_length=50, verbose_name="Primo giocatore")
    first_player_key = models.ForeignKey(Giocatore, on_delete=models.CASCADE, related_name='matches_as_first_player', verbose_name="Chiave univoca del primo giocatore")
    event_second_player = models.CharField(max_length=50, verbose_name="Secondo giocatore")
    second_player_key = models.ForeignKey(Giocatore, on_delete=models.CASCADE, related_name='matches_as_second_player', verbose_name="Chiave univoca del secondo giocatore")
    event_final_result = models.CharField(max_length=15, verbose_name="Risultato finale")
    home_odds = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Quota del Primo Giocatore (bet365)", null=True, blank=True)
    away_odds = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Quota del Secondo Giocatore (bet365)", null=True, blank=True)
    event_winner = models.CharField(max_length=15, null=True, blank=True, choices=[('First Player', 'Primo giocatore'), ('Second Player', 'Secondo giocatore')], verbose_name="Vincitore dell'evento")
    event_status = models.CharField(max_length=50, verbose_name="Stato dell'evento")
    event_type_type = models.CharField(max_length=50, verbose_name="Tipo di evento")
    tournament_name = models.CharField(max_length=100, verbose_name="Nome del torneo")
    tournament_key = models.ForeignKey(Torneo, on_delete=models.CASCADE, verbose_name="Torneo")
    tournament_round = models.CharField(max_length=50, null=True, verbose_name="Round del torneo")
    tournament_season = models.CharField(max_length=4, verbose_name="Stagione del torneo")
    event_live = models.CharField(max_length=1, choices=[('0', 'No'), ('1', 'Sì')], verbose_name="Evento dal vivo")
    event_qualification = models.BooleanField(null=True, default=None, verbose_name="Qualificazione all'evento")
    objects = MatchManager() 

    class Meta:
        verbose_name = 'Partita'
        verbose_name_plural = 'Partite'

    def __str__(self):
        return f'{self.event_first_player} vs {self.event_second_player} il {self.event_date}'

class Set(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='sets', verbose_name="Match")
    score_first = models.CharField(max_length=10, verbose_name="Punteggio Primo Giocatore")
    score_second = models.CharField(max_length=10, verbose_name="Punteggio Secondo Giocatore")
    score_set = models.CharField(max_length=10, verbose_name="Numero del Set")

    class Meta:
        verbose_name = 'Set'
        verbose_name_plural = 'Set'
        unique_together = ('match', 'score_set') 

    def __str__(self):
        return f'Set {self.score_set}: {self.score_first} - {self.score_second}'

class Game(models.Model):
    set = models.ForeignKey(Set, on_delete=models.CASCADE, related_name='games')
    number_game = models.IntegerField(null=True, blank=True)
    player_served = models.CharField(max_length=100, choices=[('First Player', 'Primo giocatore'), ('Second Player', 'Secondo giocatore')])
    serve_lost = models.CharField(max_length=100, null=True, blank=True)
    game_winner = models.CharField(max_length=100, choices=[('First Player', 'Primo giocatore'), ('Second Player', 'Secondo giocatore')])
    set_score = models.CharField(max_length=10)

    class Meta:
        verbose_name = 'Game'
        verbose_name_plural = 'Games'
        unique_together = (('set', 'number_game'),)

    def __str__(self):
        return f"Game {self.number_game} of Set {self.set.score_set}"

    def is_break(self):
        logic_break = self.game_winner and self.player_served and self.game_winner != self.player_served
        data_break = self.serve_lost and self.serve_lost == self.player_served
        return logic_break and data_break

    def clean(self):
        if self.is_break():
            if not self.serve_lost:
                self.serve_lost = self.player_served
            elif self.serve_lost != self.player_served:
                raise ValidationError(f"Discrepancy detected in Game {self.id}: Serve lost does not match the server.")
        elif self.serve_lost and self.serve_lost == self.player_served:
            raise ValidationError(f"Serve lost recorded incorrectly for Game {self.id} where no break occurred.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)



def determine_point_winner(previous_score, current_score):
    def score_to_int(score):
        if score == '0':
            return 0
        elif score == '15':
            return 15
        elif score == '30':
            return 30
        elif score == '40':
            return 40
        elif score == 'A':
            return 50
        return None

    # Gestione dei casi iniziali
    if previous_score is None:
        if current_score == '15 - 0':
            return 'First Player'
        elif current_score == '0 - 15':
            return 'Second Player'
        return None

    prev_first, prev_second = previous_score.split('-')
    curr_first, curr_second = current_score.split('-')

    prev_first, prev_second = score_to_int(prev_first.strip()), score_to_int(prev_second.strip())
    curr_first, curr_second = score_to_int(curr_first.strip()), score_to_int(curr_second.strip())

    if curr_first is None or curr_second is None or prev_first is None or prev_second is None:
        return None

    if curr_first == 40 and prev_first == 50:
        return 'Second Player'
    elif curr_second == 40 and prev_second == 50:
        return 'First Player'

    if curr_first > prev_first:
        return 'First Player'
    elif curr_second > prev_second:
        return 'Second Player'
    return None


class Point(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='points')
    number_point = models.IntegerField(verbose_name="Numero progressivo del punto")
    break_point = models.CharField(max_length=3, choices=[('yes', 'Sì'), ('no', 'No')], default='no', verbose_name="Break Point")
    game_score = models.CharField(max_length=10, verbose_name="Punteggio del Game")
    point_winner = models.CharField(max_length=100, choices=[('First Player', 'Primo giocatore'), ('Second Player', 'Secondo giocatore')], null=True, blank=True, verbose_name="Vincitore del punto")

    class Meta:
        verbose_name = 'Punto'
        verbose_name_plural = 'Punti'
        unique_together = ('game', 'number_point')

    def __str__(self):
        return f'Punto {self.number_point} nel Game {self.game.number_game} del Set {self.game.set.score_set}'

    def save(self, *args, **kwargs):
        self.clean()  # Chiamare il metodo clean per calcolare il vincitore del punto
        super().save(*args, **kwargs)

    def determine_point_winner(self):
        if not self.point_winner:
            previous_point = self.game.points.filter(number_point=self.number_point - 1).first()
            previous_score = previous_point.game_score if previous_point else None
            current_score = self.game_score
            self.point_winner = determine_point_winner(previous_score, current_score)

    def clean(self):
        self.determine_point_winner()
        super().clean()



class Tiebreak(models.Model):
    set = models.OneToOneField(Set, on_delete=models.CASCADE, related_name='tiebreak', verbose_name="Set associato")
    score_first_player = models.CharField(max_length=10, verbose_name="Punteggio finale primo giocatore")
    score_second_player = models.CharField(max_length=10, verbose_name="Punteggio finale secondo giocatore")

    class Meta:
        verbose_name = 'Tiebreak'
        verbose_name_plural = 'Tiebreaks'

    def __str__(self):
        return f"Tiebreak del {self.set.match.event_date} per il set {self.set.score_set}"

class TiebreakPoint(models.Model):
    tiebreak = models.ForeignKey(Tiebreak, on_delete=models.CASCADE, related_name='points', verbose_name="Tiebreak")
    point_number = models.IntegerField(verbose_name="Numero del punto")
    player_served = models.CharField(max_length=100, choices=[('First Player', 'Primo giocatore'), ('Second Player', 'Second giocatore')], verbose_name="Giocatore al servizio")
    point_winner = models.CharField(max_length=100, choices=[('First Player', 'Primo giocatore'), ('Second Player', 'Second giocatore')], verbose_name="Vincitore del punto")
    serve_lost = models.CharField(max_length=100, null=True, blank=True, verbose_name="Servizio perso da")
    score = models.CharField(max_length=10, verbose_name="Punteggio del punto")

    class Meta:
        verbose_name = 'Punto del Tiebreak'
        verbose_name_plural = 'Punti del Tiebreak'
        unique_together = ('tiebreak', 'point_number')

    def __str__(self):
        return f"Punto {self.point_number} del Tiebreak del Set {self.tiebreak.set.score_set}"

    def is_mini_break(self):
        """Determina se il punto corrisponde a un mini-break."""
        return self.player_served != self.point_winner

class MatchStat(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='stats', verbose_name="Partita")
    player = models.ForeignKey(Giocatore, on_delete=models.CASCADE, related_name='stats', verbose_name="Giocatore")
    stat_period = models.CharField(max_length=50, verbose_name="Periodo della statistica", default='match')
    stat_type = models.CharField(max_length=50, verbose_name="Tipo di statistica")
    stat_name = models.CharField(max_length=100, verbose_name="Nome della statistica")
    stat_value = models.CharField(max_length=50, verbose_name="Valore della statistica")
    stat_won = models.IntegerField(null=True, blank=True, verbose_name="Statistiche vinte")
    stat_total = models.IntegerField(null=True, blank=True, verbose_name="Statistiche totali")

    class Meta:
        verbose_name = 'Statistica del Match'
        verbose_name_plural = 'Statistiche dei Match'
        unique_together = (('match', 'player', 'stat_name', 'stat_period'),)

    def __str__(self):
        return f"{self.stat_name} - {self.stat_value} ({self.player.player}) nel match {self.match.id}"

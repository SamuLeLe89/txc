from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Giocatore, Torneo, Match, Set, Game, Point, Tiebreak, TiebreakPoint, MatchStat

# Admin per Giocatore
class GiocatoreAdmin(admin.ModelAdmin):
    list_display = ('player', 'player_key')
    search_fields = ('player', 'player_key')

admin.site.register(Giocatore, GiocatoreAdmin)

# Admin per Torneo
class TorneoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tipo_evento', 'superficie', 'tournament_key')
    list_filter = ('tipo_evento', 'superficie')
    search_fields = ('nome', 'tournament_key')

admin.site.register(Torneo, TorneoAdmin)

# Inline Admin per MatchStat
class MatchStatInline(admin.TabularInline):
    model = MatchStat
    extra = 1

# Admin per Match
class MatchAdmin(admin.ModelAdmin):
    list_display = ('event_key', 'event_date', 'event_time', 'link_to_first_player', 'link_to_second_player', 'event_final_result', 'tournament_name', 'event_status', 'event_type_type')
    list_filter = ('event_date', 'event_type_type', 'tournament_name', 'event_status')
    search_fields = ('event_key', 'event_first_player', 'event_second_player', 'tournament_name')
    raw_id_fields = ('first_player_key', 'second_player_key', 'tournament_key')
    inlines = [MatchStatInline]

    def link_to_first_player(self, obj):
        link = reverse("admin:tennisxchange_giocatore_change", args=[obj.first_player_key.id])
        return format_html('<a href="{}">{}</a>', link, obj.event_first_player)
    link_to_first_player.short_description = 'Primo giocatore'

    def link_to_second_player(self, obj):
        link = reverse("admin:tennisxchange_giocatore_change", args=[obj.second_player_key.id])
        return format_html('<a href="{}">{}</a>', link, obj.event_second_player)
    link_to_second_player.short_description = 'Secondo giocatore'

admin.site.register(Match, MatchAdmin)

# Admin per MatchStat
class MatchStatAdmin(admin.ModelAdmin):
    list_display = ('match', 'player', 'stat_name', 'stat_value', 'stat_won', 'stat_total')
    list_filter = ('stat_name', 'player')
    search_fields = ('match__event_key', 'player__player', 'stat_name')
    raw_id_fields = ('match', 'player')

admin.site.register(MatchStat, MatchStatAdmin)

# Inline Admin per Game
class GameInline(admin.TabularInline):
    model = Game
    extra = 0

# Inline Admin per Point
class PointInline(admin.TabularInline):
    model = Point
    extra = 0

# Inline Admin per TiebreakPoint
class TiebreakPointInline(admin.TabularInline):
    model = TiebreakPoint
    extra = 0

# Admin per Game
class GameAdmin(admin.ModelAdmin):
    list_display = ('set', 'number_game', 'player_served', 'serve_lost', 'game_winner', 'set_score')
    list_filter = ('player_served', 'game_winner', 'set')
    search_fields = ('number_game', 'player_served', 'game_winner', 'set__score_set')
    inlines = [PointInline]

    def display_set(self, obj):
        return obj.set.score_set
    display_set.short_description = 'Punteggio del Set'

admin.site.register(Game, GameAdmin)

# Admin per Set
class SetAdmin(admin.ModelAdmin):
    list_display = ('match', 'score_set', 'score_first', 'score_second')
    list_filter = ('score_set',)
    search_fields = ('match__event_first_player', 'match__event_second_player')
    inlines = [GameInline]

admin.site.register(Set, SetAdmin)

# Admin per Tiebreak
class TiebreakAdmin(admin.ModelAdmin):
    list_display = ('set', 'score_first_player', 'score_second_player')
    search_fields = ('set__match__event_first_player', 'set__match__event_second_player')
    inlines = [TiebreakPointInline]

admin.site.register(Tiebreak, TiebreakAdmin)

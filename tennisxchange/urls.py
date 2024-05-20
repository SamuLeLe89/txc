from django.urls import path
from .views import homepage, dettagli_giocatore, suggest_player, matches_today, match_details, match_details_json  

urlpatterns = [
    path('matches/today/', matches_today, name='matches_today'),
    path('match/details/<int:match_id>/', match_details, name='match_details'),
    path('', homepage, name='homepage'),
    path('giocatore/<str:player_key>/', dettagli_giocatore, name='dettagli_giocatore'),
    path('suggest-player/', suggest_player, name='suggest_player'), 
    path('match/details/json/<int:match_id>/', match_details_json, name='match-details-json'), 

]

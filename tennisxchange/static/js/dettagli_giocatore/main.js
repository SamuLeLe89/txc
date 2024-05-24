// main.js
document.addEventListener('DOMContentLoaded', function() {
    const playerKey = document.getElementById('player-key').value;
    document.querySelectorAll('.card').forEach(card => {
        const matchId = card.dataset.matchId;
        loadMatchStatistics(matchId, playerKey);
    });
    document.getElementById('load-all-details').addEventListener('click', loadAllMatchDetails);
});

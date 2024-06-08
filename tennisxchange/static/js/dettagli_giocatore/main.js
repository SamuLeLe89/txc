document.addEventListener('DOMContentLoaded', function() {
    const playerKey = document.getElementById('player-key').value;

    const loadDetailsPromises = [];

    document.querySelectorAll('.card').forEach(card => {
        const matchId = card.dataset.matchId;
        loadMatchStatistics(matchId, playerKey);
        loadDetailsPromises.push(loadMatchDetails(matchId, playerKey, true));
    });

    Promise.all(loadDetailsPromises).then(() => {
        calculateAndDisplayAggregatedStatistics();
        calculateAndDisplaySet1Statistics();
        calculateAndDisplaySet2Statistics();
        calculateAndDisplaySet3Statistics();
        calculateAndDisplaySet4Statistics();
        calculateAndDisplaySet5Statistics();
    });

    document.getElementById('load-all-details').addEventListener('click', function() {
        const loadDetailsPromises = [];
        document.querySelectorAll('.card').forEach(card => {
            const matchId = card.dataset.matchId;
            loadDetailsPromises.push(loadMatchDetails(matchId, playerKey, true));
        });
        Promise.all(loadDetailsPromises).then(() => {
            calculateAndDisplayAggregatedStatistics();
            calculateAndDisplaySet1Statistics();
            calculateAndDisplaySet2Statistics();
            calculateAndDisplaySet3Statistics();
            calculateAndDisplaySet4Statistics();
            calculateAndDisplaySet5Statistics();
        });
    });
});

// load_details.js
(function() {
    function loadAllMatchDetails() {
        const playerKey = document.getElementById('player-key').value;
        document.querySelectorAll('.card').forEach(card => {
            const matchId = card.dataset.matchId;
            loadMatchDetails(matchId, playerKey);
        });
    }

    function loadMatchDetails(matchId, playerKey) {
        const detailsDiv = document.getElementById(`details-${matchId}`);

        if (detailsDiv.style.display === 'none' || !detailsDiv.innerHTML.trim()) {
            fetch(`/match/details/json/${matchId}?player_key=${playerKey}`)
                .then(response => response.json())
                .then(data => {
                    detailsDiv.innerHTML = generateMatchDetailsHtml(data, matchId);
                    detailsDiv.style.display = 'block';
                })
                .catch(error => {
                    console.error('Errore nel caricamento dei dettagli del match:', error);
                    detailsDiv.innerHTML = `<div class="error">Errore nel caricamento dei dettagli del match</div>`;
                    detailsDiv.style.display = 'block';
                });
        } else {
            detailsDiv.style.display = 'none';
        }
    }

    function loadMatchStatistics(matchId, playerKey) {
        const statsDiv = document.getElementById(`stats-${matchId}`);

        if (statsDiv.style.display === 'none' || !statsDiv.innerHTML.trim()) {
            fetch(`/match/details/json/${matchId}?player_key=${playerKey}`)
                .then(response => response.json())
                .then(data => {
                    const pointsStats = calculateAdvancedStatistics(data);
                    const gamesStats = calculateGameStatistics(data);
                    const breakPointsStats = calculateBreakPoints(data);

                    let statsHTML = prepareStatisticsHTML(data, playerKey);
                    statsHTML += generateManualStatisticsHtml(pointsStats, gamesStats, breakPointsStats, matchId);

                    statsDiv.innerHTML = statsHTML;
                    statsDiv.style.display = 'block';
                })
                .catch(error => {
                    console.error('Errore nel caricamento delle statistiche del match:', error);
                    statsDiv.innerHTML = `<p>Errore nel caricamento delle statistiche.</p>`;
                });
        } else {
            statsDiv.style.display = 'none';
        }
    }

    function prepareStatisticsHTML(data, playerKey) {
        let statsHTML = `<div class="stats-container">`;

        const playerStatistics = data.player_statistics[playerKey];

        if (playerStatistics) {
            playerStatistics.forEach(stat => {
                const value = stat.stat_value !== null ? parseFloat(stat.stat_value).toFixed(2) : "N/D";
                const details = ` (${stat.stat_won || 0} di ${stat.stat_total || 0})`;
                statsHTML += `
                    <div class='stat-name'>${stat.stat_name}</div>
                    <div class='player-stat-value'>${value}${details}</div>
                `;
            });
        }

        statsHTML += `</div>`;
        return statsHTML;
    }

    function generateManualStatisticsHtml(pointsStats, gamesStats, breakPointsStats, matchId) {
        let statsHTML = `<div class="manual-stats-container">`;

        // Totali
        statsHTML += `
            <div class="advanced-stat">
                <strong>Points:</strong> ${pointsStats.totalPointsWon}/${pointsStats.totalPoints} (${pointsStats.winPercentage}%)<br>
                <strong>Service Points:</strong> ${pointsStats.servicePointsWon}/${pointsStats.servicePoints} (${pointsStats.serviceWinPercentage}%)<br>
                <strong>Return Points:</strong> ${pointsStats.returnPointsWon}/${pointsStats.returnPoints} (${pointsStats.returnWinPercentage}%)<br>
                <strong>Games:</strong> ${gamesStats.totalGamesWon}/${gamesStats.totalGames} (${gamesStats.winPercentage}%)<br>
                <strong>Service Games:</strong> ${gamesStats.serviceGamesWon}/${gamesStats.serviceGames} (${gamesStats.serviceWinPercentage}%)<br>
                <strong>Return Games:</strong> ${gamesStats.returnGamesWon}/${gamesStats.returnGames} (${gamesStats.returnWinPercentage}%)<br>
                <strong>Break Points Saved:</strong> ${breakPointsStats.totalBreakPointsSaved} su ${breakPointsStats.totalBreakPointsAgainst}<br>
                <strong>Break Points Converted:</strong> ${breakPointsStats.totalBreakPointsConverted} su ${breakPointsStats.totalBreakPointsFor}<br>
            </div>`;

        // Divisi per set
        statsHTML += `<div class="set-stats">`;
        pointsStats.setStats.forEach((setStats, index) => {
            const setNumber = index + 1;
            const gamesSetStats = gamesStats.setStats[index];
            const breakPointsSetStats = breakPointsStats.setStats[index];

            statsHTML += `<button onclick="toggleSetStats(${matchId}, ${setNumber})">Set ${setNumber}</button>`;
            statsHTML += `<div id="set-stats-${matchId}-${setNumber}" class="set-stat-details" style="display:none;">
                <strong>Set ${setNumber} - Points:</strong> ${setStats.pointsWon}/${setStats.pointsWon + setStats.pointsLost} (${setStats.setWinPercentage})<br>
                <strong>Set ${setNumber} - Service Points:</strong> ${setStats.servicePointsWon}/${setStats.servicePointsWon + setStats.servicePointsLost} (${setStats.setServiceWinPercentage})<br>
                <strong>Set ${setNumber} - Return Points:</strong> ${setStats.returnPointsWon}/${setStats.returnPointsWon + setStats.returnPointsLost} (${setStats.setReturnWinPercentage})<br>
                <strong>Set ${setNumber} - Games:</strong> ${gamesSetStats.gamesWon}/${gamesSetStats.gamesWon + gamesSetStats.gamesLost} (${gamesSetStats.setWinPercentage})<br>
                <strong>Set ${setNumber} - Service Games:</strong> ${gamesSetStats.serviceGamesWon}/${gamesSetStats.serviceGamesWon + gamesSetStats.serviceGamesLost} (${gamesSetStats.setServiceWinPercentage})<br>
                <strong>Set ${setNumber} - Return Games:</strong> ${gamesSetStats.returnGamesWon}/${gamesSetStats.returnGamesWon + gamesSetStats.returnGamesLost} (${gamesSetStats.setReturnWinPercentage})<br>
                <strong>Set ${setNumber} - Break Points Saved:</strong> ${breakPointsSetStats.breakPointsSaved} su ${breakPointsSetStats.breakPointsAgainst}<br>
                <strong>Set ${setNumber} - Break Points Converted:</strong> ${breakPointsSetStats.breakPointsConverted} su ${breakPointsSetStats.breakPointsFor}<br>`;
            if (setStats.tiebreak) {
                statsHTML += `<strong>Set ${setNumber} - Tiebreak Result:</strong> ${setStats.tiebreak}<br>`;
            }
            statsHTML += `</div>`;
        });
        statsHTML += `</div>`;

        statsHTML += `</div>`;
        return statsHTML;
    }

    function toggleSetStats(matchId, setNumber) {
        const setStatsDiv = document.getElementById(`set-stats-${matchId}-${setNumber}`);
        if (setStatsDiv) {
            setStatsDiv.style.display = setStatsDiv.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Esporta le funzioni nel contesto globale
    window.loadAllMatchDetails = loadAllMatchDetails;
    window.loadMatchDetails = loadMatchDetails;
    window.loadMatchStatistics = loadMatchStatistics;
})();

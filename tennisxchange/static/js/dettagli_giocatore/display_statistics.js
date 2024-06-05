(function() {
    function displaySetStatistics(sets, matchId, pointsStats, gamesStats, breakPointsStats) {
        // Assicurati che calculateFirstBreakAndCounter sia disponibile nel contesto globale
        const firstBreakStats = window.calculateFirstBreakAndCounter({ sets });

        let statsHTML = '';
        sets.forEach((set, index) => {
            const setNumber = set.set_number;
            const pointsSetStats = pointsStats.setStats[index];
            const gamesSetStats = gamesStats.setStats[index];
            const breakPointsSetStats = breakPointsStats.setStats[index];
            const firstBreakStat = firstBreakStats.find(stat => stat.setNumber === setNumber);

            const setWinner = window.calculateSetWinnerFromHTML(matchId, setNumber);

            let prevSetResult = 'None';
            if (index > 0) {
                const prevSet = sets[index - 1];
                prevSetResult = window.calculateSetWinnerFromHTML(matchId, prevSet.set_number);
            }

            statsHTML += `
                <div id="set-stats-${matchId}-${setNumber}" class="set-stat-details">
                    <h3>Set ${setNumber} - Result: ${setWinner} (Prev Set: ${prevSetResult})</h3>
                    <p><strong>Points:</strong> ${pointsSetStats.pointsWon}/${pointsSetStats.pointsWon + pointsSetStats.pointsLost} (${pointsSetStats.setWinPercentage})</p>
                    <p><strong>Service Points:</strong> ${pointsSetStats.servicePointsWon}/${pointsSetStats.servicePointsWon + pointsSetStats.servicePointsLost} (${pointsSetStats.setServiceWinPercentage})</p>
                    <p><strong>Return Points:</strong> ${pointsSetStats.returnPointsWon}/${pointsSetStats.returnPointsWon + pointsSetStats.returnPointsLost} (${pointsSetStats.setReturnWinPercentage})</p>
                    <p><strong>Games:</strong> ${gamesSetStats.gamesWon}/${gamesSetStats.gamesWon + gamesSetStats.gamesLost} (${gamesSetStats.setWinPercentage})</p>
                    <p><strong>Service Games:</strong> ${gamesSetStats.serviceGamesWon}/${gamesSetStats.serviceGamesWon + gamesSetStats.serviceGamesLost} (${gamesSetStats.setServiceWinPercentage})</p>
                    <p><strong>Return Games:</strong> ${gamesSetStats.returnGamesWon}/${gamesSetStats.returnGamesWon + gamesSetStats.returnGamesLost} (${gamesSetStats.setReturnWinPercentage})</p>
                    <p><strong>Break Points Saved:</strong> ${breakPointsSetStats.breakPointsSaved} su ${breakPointsSetStats.breakPointsAgainst}</p>
                    <p><strong>Break Points Converted:</strong> ${breakPointsSetStats.breakPointsConverted} su ${breakPointsSetStats.breakPointsFor}</p>
                    <p><strong>First Break:</strong> ${firstBreakStat.firstBreak}</p>
                    <p><strong>Counter Break:</strong> ${firstBreakStat.counterBreak}</p>`;

            if (pointsSetStats.tiebreak) {
                statsHTML += `<p><strong>Tiebreak Result:</strong> ${pointsSetStats.tiebreak}</p>`;
            }

            statsHTML += `</div>`;
        });

        const statsDiv = document.getElementById(`set-stats-${matchId}`);
        if (statsDiv) {
            statsDiv.innerHTML = statsHTML;
            statsDiv.style.display = 'block';
        } else {
            console.error(`Elemento con ID set-stats-${matchId} non trovato.`);
        }
    }

    function displayTotalStatistics(pointsStats, gamesStats, breakPointsStats, matchId) {
        const statsDiv = document.getElementById(`stats-${matchId}`);
        if (statsDiv) {
            let statsHTML = `
                <div class="advanced-stat">
                    <strong>Points:</strong> ${pointsStats.totalPointsWon}/${pointsStats.totalPoints} (${pointsStats.winPercentage}%)<br>
                    <strong>Service Points:</strong> ${pointsStats.servicePointsWon}/${pointsStats.servicePoints} (${pointsStats.serviceWinPercentage}%)<br>
                    <strong>Return Points:</strong> ${pointsStats.returnPointsWon}/${pointsStats.returnPoints} (${pointsStats.returnWinPercentage}%)<br>
                    <strong>Games:</strong> ${gamesStats.totalGamesWon}/${gamesStats.totalGames} (${gamesStats.winPercentage}%)<br>
                    <strong>Service Games:</strong> ${gamesStats.serviceGamesWon}/${gamesStats.serviceGames} (${gamesStats.serviceWinPercentage}%)<br>
                    <strong>Return Games:</strong> ${gamesStats.returnGamesWon}/${gamesStats.returnGames} (${gamesStats.returnWinPercentage}%)<br>
                    <strong>Break Points Saved:</strong> ${breakPointsStats.totalBreakPointsSaved} su ${breakPointsStats.totalBreakPointsAgainst}<br>
                    <strong>Break Points Converted:</strong> ${breakPointsStats.totalBreakPointsConverted} su ${breakPointsStats.totalBreakPointsFor}<br>`;
            pointsStats.setStats.forEach((setStats, index) => {
                if (setStats.tiebreak) {
                    statsHTML += `<strong>Set ${index + 1} - Tiebreak Result:</strong> ${setStats.tiebreak}<br>`;
                }
            });
            statsHTML += `</div>`;

            statsDiv.innerHTML = statsHTML;
            statsDiv.style.display = 'block';
        } else {
            console.error(`Elemento con ID stats-${matchId} non trovato.`);
        }
    }

    function toggleSetStats(matchId, setNumber) {
        const setStatsDiv = document.getElementById(`set-stats-${matchId}-${setNumber}`);
        if (setStatsDiv) {
            setStatsDiv.style.display = setStatsDiv.style.display === 'none' ? 'block' : 'none';
        }
    }

    window.displaySetStatistics = displaySetStatistics;
    window.displayTotalStatistics = displayTotalStatistics;
    window.toggleSetStats = toggleSetStats;
})();

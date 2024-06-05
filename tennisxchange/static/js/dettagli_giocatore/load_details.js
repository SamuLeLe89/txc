(function() {
    function loadAllMatchDetails() {
        const playerKey = document.getElementById('player-key').value;
        document.querySelectorAll('.card').forEach(card => {
            const matchId = card.dataset.matchId;
            loadMatchDetails(matchId, playerKey, true);
        });
    }

    function loadMatchDetails(matchId, playerKey, loadFullDetails = false) {
        return new Promise((resolve, reject) => {
            const detailsDiv = document.getElementById(`details-${matchId}`);
            const setStatsDiv = document.getElementById(`set-stats-${matchId}`);
    
            if (loadFullDetails && (detailsDiv.style.display === 'none' || !detailsDiv.innerHTML.trim())) {
                fetch(`/match/details/json/${matchId}?player_key=${playerKey}`)
                    .then(response => response.json())
                    .then(data => {
                        data.sets.forEach((set, index) => {
                            if (index > 0) {
                                const prevSet = data.sets[index - 1];
                                const prevSetWinner = prevSet.score_first > prevSet.score_second ? 'Win' : 'Loss';
                                set.previousSetResult = prevSetWinner;
                            } else {
                                set.previousSetResult = 'None';
                            }
                        });
    
                        detailsDiv.innerHTML = generateMatchDetailsHtml(data, matchId);
                        detailsDiv.style.display = 'block';
    
                        const headerElement = document.querySelector(`.card[data-match-id="${matchId}"] .header`);
                        if (!headerElement.querySelector('.match-winner')) {
                            const matchWinner = calculateMatchWinnerFromHTML(matchId);
                            const matchWinnerElement = document.createElement('div');
                            matchWinnerElement.classList.add('match-winner');
                            matchWinnerElement.innerHTML = `<strong>${matchWinner}</strong>`;
                            headerElement.appendChild(matchWinnerElement);
    
                            if (matchWinner === 'Win') {
                                headerElement.parentElement.classList.add('match-result-win');
                            } else if (matchWinner === 'Loss') {
                                headerElement.parentElement.classList.add('match-result-loss');
                            }
                        }
    
                        const pointsStats = calculateAdvancedStatistics(data);
                        const gamesStats = calculateGameStatistics(data);
                        const breakPointsStats = calculateBreakPoints(data);
    
                        displaySetStatistics(data.sets, matchId, pointsStats, gamesStats, breakPointsStats);
                        resolve(); // Risolve la promessa una volta che i dettagli sono stati caricati e visualizzati
                    })
                    .catch(error => {
                        console.error('Errore nel caricamento dei dettagli del match:', error);
                        detailsDiv.innerHTML = `<div class="error">Errore nel caricamento dei dettagli del match</div>`;
                        detailsDiv.style.display = 'block';
                        reject(error); // Rigetta la promessa in caso di errore
                    });
            } else if (!loadFullDetails) {
                fetch(`/match/details/json/${matchId}?player_key=${playerKey}`)
                    .then(response => response.json())
                    .then(data => {
                        const headerElement = document.querySelector(`.card[data-match-id="${matchId}"] .header`);
                        if (!headerElement.querySelector('.match-winner')) {
                            const matchWinner = calculateMatchWinnerFromHTML(matchId);
                            const matchWinnerElement = document.createElement('div');
                            matchWinnerElement.classList.add('match-winner');
                            matchWinnerElement.innerHTML = `<strong>${matchWinner}</strong>`;
                            headerElement.appendChild(matchWinnerElement);
    
                            if (matchWinner === 'Win') {
                                headerElement.parentElement.classList.add('match-result-win');
                            } else if (matchWinner === 'Loss') {
                                headerElement.parentElement.classList.add('match-result-loss');
                            }
                        }
    
                        const pointsStats = calculateAdvancedStatistics(data);
                        const gamesStats = calculateGameStatistics(data);
                        const breakPointsStats = calculateBreakPoints(data);
    
                        displaySetStatistics(data.sets, matchId, pointsStats, gamesStats, breakPointsStats);
                        resolve(); // Risolve la promessa una volta che i dettagli sono stati caricati e visualizzati
                    })
                    .catch(error => {
                        console.error('Errore nel caricamento dei dettagli del match:', error);
                        reject(error); // Rigetta la promessa in caso di errore
                    });
            }
        });
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

        statsHTML += `</div>`;
        return statsHTML;
    }

    function calculateAndDisplaySet1Statistics() {
        const matches = document.querySelectorAll('.card');
        let totalPoints = 0;
        let totalServicePoints = 0;
        let totalReturnPoints = 0;
        let totalGames = 0;
        let totalServiceGames = 0;
        let totalReturnGames = 0;
        let totalBreakPointsSaved = 0;
        let totalBreakPointsConverted = 0;
    
        matches.forEach(match => {
            const set1Stats = match.querySelector('#set-stats-' + match.dataset.matchId + '-1');
    
            if (set1Stats) {
                const points = parseInt(set1Stats.querySelector('.points').textContent.split('/')[0]);
                const servicePoints = parseInt(set1Stats.querySelector('.service-points').textContent.split('/')[0]);
                const returnPoints = parseInt(set1Stats.querySelector('.return-points').textContent.split('/')[0]);
                const games = parseInt(set1Stats.querySelector('.games').textContent.split('/')[0]);
                const serviceGames = parseInt(set1Stats.querySelector('.service-games').textContent.split('/')[0]);
                const returnGames = parseInt(set1Stats.querySelector('.return-games').textContent.split('/')[0]);
                const breakPointsSaved = parseInt(set1Stats.querySelector('.break-points-saved').textContent.split(' ')[0]);
                const breakPointsConverted = parseInt(set1Stats.querySelector('.break-points-converted').textContent.split(' ')[0]);
    
                totalPoints += points;
                totalServicePoints += servicePoints;
                totalReturnPoints += returnPoints;
                totalGames += games;
                totalServiceGames += serviceGames;
                totalReturnGames += returnGames;
                totalBreakPointsSaved += breakPointsSaved;
                totalBreakPointsConverted += breakPointsConverted;
            }
        });
    
        document.getElementById('set1-points').textContent = totalPoints;
        document.getElementById('set1-service-points').textContent = totalServicePoints;
        document.getElementById('set1-return-points').textContent = totalReturnPoints;
        document.getElementById('set1-games').textContent = totalGames;
        document.getElementById('set1-service-games').textContent = totalServiceGames;
        document.getElementById('set1-return-games').textContent = totalReturnGames;
        document.getElementById('set1-break-points-saved').textContent = totalBreakPointsSaved;
        document.getElementById('set1-break-points-converted').textContent = totalBreakPointsConverted;
    }
    
    // Assicurati che la funzione sia disponibile globalmente
    window.calculateAndDisplaySet1Statistics = calculateAndDisplaySet1Statistics;
    window.loadAllMatchDetails = loadAllMatchDetails;
    window.loadMatchDetails = loadMatchDetails;
    window.loadMatchStatistics = loadMatchStatistics;
})();

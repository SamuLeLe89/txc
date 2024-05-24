document.addEventListener('DOMContentLoaded', loadAllMatchDetails);

function loadAllMatchDetails() {
    const playerKey = document.getElementById('player-key').value;
    document.querySelectorAll('.card').forEach(card => {
        const matchId = card.dataset.matchId;
        loadMatchDetails(matchId, playerKey);
    });
}

function loadMatchDetails(matchId, playerKey) {
    const detailsDiv = document.getElementById(`details-${matchId}`);

    fetch(`/match/details/json/${matchId}?player_key=${playerKey}`)
        .then(response => response.json())
        .then(data => {
            detailsDiv.innerHTML = generateMatchDetailsHtml(data, matchId);
            detailsDiv.style.display = 'block';

            const pointsStats = calculateAdvancedStatistics(data);
            const gamesStats = calculateGameStatistics(data);
            const breakPointsStats = calculateBreakPoints(data);

            displaySetStatistics(data.sets, matchId, pointsStats, gamesStats, breakPointsStats);
            displayTotalStatistics(pointsStats, gamesStats, breakPointsStats, matchId);

            const headerElement = document.querySelector(`.card[data-match-id="${matchId}"] .header`);
            if (!headerElement.querySelector('.match-winner')) {
                const matchWinner = calculateMatchWinnerFromHTML(matchId);
                const matchWinnerElement = document.createElement('div');
                matchWinnerElement.classList.add('match-winner');
                matchWinnerElement.innerHTML = `<strong>Winner: ${matchWinner}</strong>`;
                headerElement.appendChild(matchWinnerElement);
            }
        })
        .catch(error => {
            console.error('Errore nel caricamento dei dettagli del match:', error);
            detailsDiv.innerHTML = `<div class="error">Errore nel caricamento dei dettagli del match</div>`;
            detailsDiv.style.display = 'block';
        });
}

function generateMatchDetailsHtml(data, matchId) {
    let detailsHtml = `<div><strong>Match ID: ${data.match_id}</strong></div>`;
    data.sets.forEach((set, setIndex) => {
        const setWinner = calculateSetWinnerFromHTML(matchId, set.set_number);
        detailsHtml += `<div class='set'><strong>Set ${set.set_number} - Winner: ${setWinner}</strong></div>`;
        set.games.forEach((game, gameIndex) => {
            let breakInfo = '';
            if (game.serve_lost) {
                if (game.serve_lost === 'First Player') {
                    breakInfo = '<span class="break-loss"></span>';
                } else if (game.serve_lost === 'Second Player') {
                    breakInfo = '<span class="break-win"></span>';
                }
            }

            // Conta i break point nel game e genera le palline colorate
            const breakPoints = game.points.filter(point => point.break_point === 'yes');
            let breakPointsHtml = '';
            breakPoints.forEach(point => {
                if (game.player_served === 'First Player') {
                    breakPointsHtml += '<span class="break-point red"></span>';
                } else {
                    breakPointsHtml += '<span class="break-point green"></span>';
                }
            });
            const breakPointsText = breakPoints.length > 0 ? `<div class="break-point-container">${breakPointsHtml}</div>` : '';

            // Aggiungi l'indicazione 'Serve' o 'Receive' per il primo gioco del set
            let serveReceiveInfo = '';
            if (gameIndex === 0) {
                serveReceiveInfo = game.player_served === 'First Player' ? '<span class="serve-receive">(S)</span>' : '<span class="serve-receive">(R)</span>';
            }

            detailsHtml += `
                <div class='game'>
                    <span class='game-score'>${game.score}</span>
                    ${breakInfo}
                    ${breakPointsText}
                    ${serveReceiveInfo}
                    
                </div>`;
        });

        if (set.tiebreak) {
            const tiebreakWinner = calculateTiebreakWinner(set.tiebreak);
            const tiebreakResult = tiebreakWinner === 'First Player' ? 'Win' : 'Loss';
            detailsHtml += `<div class='tiebreak'>Tiebreak: ${tiebreakResult} (${set.tiebreak.score_first_player} - ${set.tiebreak.score_second_player})</div>`;
            set.tiebreak.points.forEach(point => {
                detailsHtml += `<div class='tiebreak-point hidden'>Punto ${point.point_number}: ${point.score} - ${point.player_served} serve, ${point.point_winner} win, mini-break: ${point.is_mini_break ? 'Yes' : 'No'}</div>`;
            });
        }
    });
    return detailsHtml;
}


function calculateTiebreakWinner(tiebreak) {
    const scoreFirstPlayer = parseInt(tiebreak.score_first_player, 10);
    const scoreSecondPlayer = parseInt(tiebreak.score_second_player, 10);

    if (scoreFirstPlayer > scoreSecondPlayer) {
        return 'First Player';
    } else {
        return 'Second Player';
    }
}


function calculateSetWinnerFromHTML(matchId, setNumber) {
    const setScoreElement = document.querySelector(`.card[data-match-id="${matchId}"] .set-scores`);
    const setScores = setScoreElement.innerText.match(/(\d+)-(\d+)/g);
    const setScore = setScores[setNumber - 1];
    const [scoreFirst, scoreSecond] = setScore.split('-').map(Number);

    if (scoreFirst > scoreSecond) {
        return 'First Player';
    } else if (scoreSecond > scoreFirst) {
        return 'Second Player';
    } else {
        return 'Draw'; // Aggiunta di sicurezza, ma nel tennis un set non può terminare in pareggio
    }
}

function calculateMatchWinnerFromHTML(matchId) {
    const setScoreElement = document.querySelector(`.card[data-match-id="${matchId}"] .set-scores`);
    const setScores = setScoreElement.innerText.match(/(\d+)-(\d+)/g);
    let firstPlayerWins = 0;
    let secondPlayerWins = 0;

    setScores.forEach(setScore => {
        const [scoreFirst, scoreSecond] = setScore.split('-').map(Number);
        if (scoreFirst > scoreSecond) {
            firstPlayerWins++;
        } else if (scoreSecond > scoreFirst) {
            secondPlayerWins++;
        }
    });

    return firstPlayerWins > secondPlayerWins ? 'First Player' : 'Second Player';
}

function calculateAdvancedStatistics(data) {
    let totalPointsWon = 0;
    let totalPointsLost = 0;
    let servicePointsWon = 0;
    let servicePointsLost = 0;
    let returnPointsWon = 0;
    let returnPointsLost = 0;
    const setStats = [];

    data.sets.forEach(set => {
        let setServicePointsWon = 0;
        let setServicePointsLost = 0;
        let setReturnPointsWon = 0;
        let setReturnPointsLost = 0;

        set.games.forEach(game => {
            const serverIsFirstPlayer = game.player_served === 'First Player';
            
            game.points.forEach(point => {
                const pointWonByFirstPlayer = point.point_winner === 'First Player';
                
                if (serverIsFirstPlayer) {
                    if (pointWonByFirstPlayer) {
                        setServicePointsWon++;
                    } else {
                        setServicePointsLost++;
                    }
                } else {
                    if (pointWonByFirstPlayer) {
                        setReturnPointsWon++;
                    } else {
                        setReturnPointsLost++;
                    }
                }
            });

            const gameWonByFirstPlayer = game.game_winner === 'First Player';
            
            if (serverIsFirstPlayer) {
                if (gameWonByFirstPlayer) {
                    setServicePointsWon++;
                } else {
                    setServicePointsLost++;
                }
            } else {
                if (gameWonByFirstPlayer) {
                    setReturnPointsWon++;
                } else {
                    setReturnPointsLost++;
                }
            }
        });

        if (set.tiebreak) {
            set.tiebreak.points.forEach(point => {
                const pointWonByFirstPlayer = point.point_winner === 'First Player';
                const serverIsFirstPlayer = point.player_served === 'First Player';
                
                if (serverIsFirstPlayer) {
                    if (pointWonByFirstPlayer) {
                        setServicePointsWon++;
                    } else {
                        setServicePointsLost++;
                    }
                } else {
                    if (pointWonByFirstPlayer) {
                        setReturnPointsWon++;
                    } else {
                        setReturnPointsLost++;
                    }
                }
            });
        }

        const setTotalPoints = setServicePointsWon + setServicePointsLost + setReturnPointsWon + setReturnPointsLost;
        const setWinPercentage = setTotalPoints ? ((setServicePointsWon + setReturnPointsWon) / setTotalPoints * 100).toFixed(2) : "N/A";
        const setServicePoints = setServicePointsWon + setServicePointsLost;
        const setServiceWinPercentage = setServicePoints ? (setServicePointsWon / setServicePoints * 100).toFixed(2) : "N/A";
        const setReturnPoints = setReturnPointsWon + setReturnPointsLost;
        const setReturnWinPercentage = setReturnPoints ? (setReturnPointsWon / setReturnPoints * 100).toFixed(2) : "N/A";

        totalPointsWon += setServicePointsWon + setReturnPointsWon;
        totalPointsLost += setServicePointsLost + setReturnPointsLost;
        servicePointsWon += setServicePointsWon;
        servicePointsLost += setServicePointsLost;
        returnPointsWon += setReturnPointsWon;
        returnPointsLost += setReturnPointsLost;

        setStats.push({
            setNumber: set.set_number,
            pointsWon: setServicePointsWon + setReturnPointsWon,
            pointsLost: setServicePointsLost + setReturnPointsLost,
            servicePointsWon: setServicePointsWon,
            servicePointsLost: setServicePointsLost,
            returnPointsWon: setReturnPointsWon,
            returnPointsLost: setReturnPointsLost,
            setWinPercentage,
            setServiceWinPercentage,
            setReturnWinPercentage,
            tiebreak: set.tiebreak ? (calculateTiebreakWinner(set.tiebreak) === 'First Player' ? 'Win' : 'Loss') : null
        });
    });

    const totalPoints = totalPointsWon + totalPointsLost;
    const winPercentage = totalPoints ? ((totalPointsWon / totalPoints) * 100).toFixed(2) : "N/A";
    const servicePoints = servicePointsWon + servicePointsLost;
    const serviceWinPercentage = servicePoints ? ((servicePointsWon / servicePoints) * 100).toFixed(2) : "N/A";
    const returnPoints = returnPointsWon + returnPointsLost;
    const returnWinPercentage = returnPoints ? ((returnPointsWon / returnPoints) * 100).toFixed(2) : "N/A";

    return {
        setStats,
        totalPointsWon,
        totalPoints,
        winPercentage,
        servicePointsWon,
        servicePoints,
        serviceWinPercentage,
        returnPointsWon,
        returnPoints,
        returnWinPercentage
    };
}

function calculateGameStatistics(data) {
    let totalGamesWon = 0;
    let totalGamesLost = 0;
    let serviceGamesWon = 0;
    let serviceGamesLost = 0;
    let returnGamesWon = 0;
    let returnGamesLost = 0;
    const setStats = [];

    data.sets.forEach(set => {
        let setGamesWon = 0;
        let setGamesLost = 0;
        let setServiceGamesWon = 0;
        let setServiceGamesLost = 0;
        let setReturnGamesWon = 0;
        let setReturnGamesLost = 0;

        set.games.forEach(game => {
            const serverIsFirstPlayer = game.player_served === 'First Player';
            const gameWonByFirstPlayer = game.game_winner === 'First Player';

            if (serverIsFirstPlayer) {
                if (gameWonByFirstPlayer) {
                    setServiceGamesWon++;
                } else {
                    setServiceGamesLost++;
                }
            } else {
                if (gameWonByFirstPlayer) {
                    setReturnGamesWon++;
                } else {
                    setReturnGamesLost++;
                }
            }

            if (gameWonByFirstPlayer) {
                setGamesWon++;
            } else {
                setGamesLost++;
            }
        });

        totalGamesWon += setGamesWon;
        totalGamesLost += setGamesLost;
        serviceGamesWon += setServiceGamesWon;
        serviceGamesLost += setServiceGamesLost;
        returnGamesWon += setReturnGamesWon;
        returnGamesLost += setReturnGamesLost;

        const setTotalGames = setGamesWon + setGamesLost;
        const setWinPercentage = setTotalGames ? ((setGamesWon / setTotalGames) * 100).toFixed(2) : "N/A";
        const setServiceGames = setServiceGamesWon + setServiceGamesLost;
        const setServiceWinPercentage = setServiceGames ? (setServiceGamesWon / setServiceGames * 100).toFixed(2) : "N/A";
        const setReturnGames = setReturnGamesWon + setReturnGamesLost;
        const setReturnWinPercentage = setReturnGames ? (setReturnGamesWon / setReturnGames * 100).toFixed(2) : "N/A";

        setStats.push({
            setNumber: set.set_number,
            gamesWon: setGamesWon,
            gamesLost: setGamesLost,
            serviceGamesWon: setServiceGamesWon,
            serviceGamesLost: setServiceGamesLost,
            returnGamesWon: setReturnGamesWon,
            returnGamesLost: setReturnGamesLost,
            setWinPercentage,
            setServiceWinPercentage,
            setReturnWinPercentage,
            tiebreak: set.tiebreak ? (calculateTiebreakWinner(set.tiebreak) === 'First Player' ? 'Win' : 'Loss') : null
        });
    });

    const totalGames = totalGamesWon + totalGamesLost;
    const winPercentage = totalGames ? ((totalGamesWon / totalGames) * 100).toFixed(2) : "N/A";
    const serviceGames = serviceGamesWon + serviceGamesLost;
    const serviceWinPercentage = serviceGames ? ((serviceGamesWon / serviceGames) * 100).toFixed(2) : "N/A";
    const returnGames = returnGamesWon + returnGamesLost;
    const returnWinPercentage = returnGames ? ((returnGamesWon / returnGames) * 100).toFixed(2) : "N/A";

    return {
        setStats,
        totalGamesWon,
        totalGames,
        winPercentage,
        serviceGamesWon,
        serviceGames,
        serviceWinPercentage,
        returnGamesWon,
        returnGames,
        returnWinPercentage
    };
}

function calculateBreakPoints(data) {
    let breakPointsAgainst = 0; // Palle break concesse
    let breakPointsFor = 0;     // Palle break avute
    let breakPointsSaved = 0;   // Palle break salvate
    let breakPointsConverted = 0; // Palle break convertite
    const setStats = [];

    data.sets.forEach(set => {
        let setBreakPointsAgainst = 0;
        let setBreakPointsFor = 0;
        let setServiceGamesTotal = 0;
        let setServiceGamesWon = 0;
        let setReturnGamesWon = 0;

        set.games.forEach(game => {
            if (game.player_served === 'First Player') {
                setServiceGamesTotal++;
                if (game.game_winner === 'First Player') {
                    setServiceGamesWon++;
                }
            } else {
                if (game.game_winner === 'First Player') {
                    setReturnGamesWon++;
                }
            }

            game.points.forEach(point => {
                if (point.break_point === 'yes') { // Cambiato per confrontare il testo 'yes'
                    if (game.player_served === 'First Player') {
                        setBreakPointsAgainst++; // Palla break concessa
                    } else {
                        setBreakPointsFor++; // Palla break avuta
                    }
                }
            });
        });

        breakPointsAgainst += setBreakPointsAgainst;
        breakPointsFor += setBreakPointsFor;

        const setBreakPointsSaved = setBreakPointsAgainst - (setServiceGamesTotal - setServiceGamesWon);
        const setBreakPointsConverted = setReturnGamesWon;

        breakPointsSaved += setBreakPointsSaved;
        breakPointsConverted += setBreakPointsConverted;

        setStats.push({
            setNumber: set.set_number,
            breakPointsAgainst: setBreakPointsAgainst,
            breakPointsFor: setBreakPointsFor,
            breakPointsSaved: setBreakPointsSaved,
            breakPointsConverted: setBreakPointsConverted,
            tiebreak: set.tiebreak ? (calculateTiebreakWinner(set.tiebreak) === 'First Player' ? 'Win' : 'Loss') : null
        });
    });

    return {
        setStats,
        totalBreakPointsAgainst: breakPointsAgainst,
        totalBreakPointsFor: breakPointsFor,
        totalBreakPointsSaved: breakPointsSaved,
        totalBreakPointsConverted: breakPointsConverted
    };
}

function displaySetStatistics(sets, matchId, pointsStats, gamesStats, breakPointsStats) {
    let statsHTML = '';
    sets.forEach((set, index) => {
        const setNumber = set.set_number;
        const pointsSetStats = pointsStats.setStats[index];
        const gamesSetStats = gamesStats.setStats[index];
        const breakPointsSetStats = breakPointsStats.setStats[index];

        statsHTML += `<button onclick="toggleSetStats(${matchId}, ${setNumber})">Set ${setNumber}</button>`;
        statsHTML += `<div id="set-stats-${matchId}-${setNumber}" class="set-stat-details" style="display:none;">
            <strong>Set ${setNumber} - Points:</strong> ${pointsSetStats.pointsWon}/${pointsSetStats.pointsWon + pointsSetStats.pointsLost} (${pointsSetStats.setWinPercentage})<br>
            <strong>Set ${setNumber} - Service Points:</strong> ${pointsSetStats.servicePointsWon}/${pointsSetStats.servicePointsWon + pointsSetStats.servicePointsLost} (${pointsSetStats.setServiceWinPercentage})<br>
            <strong>Set ${setNumber} - Return Points:</strong> ${pointsSetStats.returnPointsWon}/${pointsSetStats.returnPointsWon + pointsSetStats.returnPointsLost} (${pointsSetStats.setReturnWinPercentage})<br>
            <strong>Set ${setNumber} - Games:</strong> ${gamesSetStats.gamesWon}/${gamesSetStats.gamesWon + gamesSetStats.gamesLost} (${gamesSetStats.setWinPercentage})<br>
            <strong>Set ${setNumber} - Service Games:</strong> ${gamesSetStats.serviceGamesWon}/${gamesSetStats.serviceGamesWon + gamesSetStats.serviceGamesLost} (${gamesSetStats.setServiceWinPercentage})<br>
            <strong>Set ${setNumber} - Return Games:</strong> ${gamesSetStats.returnGamesWon}/${gamesSetStats.returnGamesWon + gamesSetStats.returnGamesLost} (${gamesSetStats.setReturnWinPercentage})<br>
            <strong>Set ${setNumber} - Break Points Saved:</strong> ${breakPointsSetStats.breakPointsSaved} su ${breakPointsSetStats.breakPointsAgainst}<br>
            <strong>Set ${setNumber} - Break Points Converted:</strong> ${breakPointsSetStats.breakPointsConverted} su ${breakPointsSetStats.breakPointsFor}<br>`;
        if (pointsSetStats.tiebreak) {
            statsHTML += `<strong>Set ${setNumber} - Tiebreak Result:</strong> ${pointsSetStats.tiebreak}<br>`;
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




function loadStatisticsForAllMatches() {
    const playerKey = document.getElementById('player-key').value; // Recupera il player_key dal campo nascosto
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const matchId = card.dataset.matchId;
        const statsDiv = document.getElementById(`stats-${matchId}`);

        fetch(`/match/details/json/${matchId}?player_key=${playerKey}`)
            .then(response => response.json())
            .then(data => {
                let statsHTML = prepareStatisticsHTML(data, playerKey);
                statsDiv.innerHTML = statsHTML;
                statsDiv.style.display = 'block';
            })
            .catch(error => {
                console.error('Errore nel caricamento delle statistiche del match:', error);
                statsDiv.innerHTML = `<p>Errore nel caricamento delle statistiche.</p>`;
            });
    });
}

function prepareStatisticsHTML(data, playerKey) {
    let statsHTML = `<div class="stats-container">`;

    // Utilizza il player_key per identificare le statistiche corrette
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

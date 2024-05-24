(function() {
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
        if (!setScoreElement) {
            return 'Draw'; // Se l'elemento non è trovato, consideriamo un pareggio per sicurezza
        }
        const setScores = setScoreElement.innerText.match(/(\d+)-(\d+)/g);
        const setScore = setScores[setNumber - 1];
        const [scoreFirst, scoreSecond] = setScore.split('-').map(Number);

        if (scoreFirst > scoreSecond) {
            return 'First Player';
        } else if (scoreSecond > scoreFirst) {
            return 'Second Player';
        } else {
            return 'Draw'; 
        }
    }

    function calculateMatchWinnerFromHTML(matchId) {
        const setScoreElement = document.querySelector(`.card[data-match-id="${matchId}"] .set-scores`);
        if (!setScoreElement) {
            return 'Draw'; // Se l'elemento non è trovato, consideriamo un pareggio per sicurezza
        }
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

    // Esporta le funzioni nel contesto globale
    window.generateMatchDetailsHtml = generateMatchDetailsHtml;
    window.calculateTiebreakWinner = calculateTiebreakWinner;
    window.calculateSetWinnerFromHTML = calculateSetWinnerFromHTML;
    window.calculateMatchWinnerFromHTML = calculateMatchWinnerFromHTML;
})();

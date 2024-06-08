function generateMatchDetailsHtml(data, matchId) {
    console.log('Generating HTML for match:', matchId, data); // Log per verificare i dati

    // Inizio del markup HTML
    let detailsHtml = `<div><strong>Match ID: ${matchId}</strong></div>`;

    data.sets.forEach((set, setIndex) => {
        const setWinner = window.calculateSetWinnerFromHTML(matchId, set.set_number);
        console.log('Set winner calculated:', setWinner); // Log per verificare il vincitore del set

        // Aggiungi il risultato del set precedente se non è il primo set
        let prevSetResult = 'None';
        if (setIndex > 0) {
            const prevSet = data.sets[setIndex - 1];
            prevSetResult = window.calculateSetWinnerFromHTML(matchId, prevSet.set_number);
        }

        detailsHtml += `<div class='set set-result-${setWinner.toLowerCase()}'><strong class="set-winner ${setWinner}">Set ${set.set_number}: ${setWinner} </strong></div>`;

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
            const tiebreakWinner = window.calculateTiebreakWinner(set.tiebreak);
            const tiebreakResult = tiebreakWinner === 'First Player' ? 'Win' : 'Loss';
            detailsHtml += `<div class='tiebreak'>Tiebreak: ${tiebreakResult} (${set.tiebreak.score_first_player} - ${set.tiebreak.score_second_player})</div>`;
            set.tiebreak.points.forEach(point => {
                detailsHtml += `<div class='tiebreak-point hidden'>Punto ${point.point_number}: ${point.score} - ${point.player_served} serve, ${point.point_winner} win, mini-break: ${point.is_mini_break ? 'Yes' : 'No'}</div>`;
            });
        }
    });

    console.log('Generated HTML:', detailsHtml); // Log per verificare il markup HTML generato
    return detailsHtml;
}

// Esporta le funzioni nel contesto globale
window.generateMatchDetailsHtml = generateMatchDetailsHtml;

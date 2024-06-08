function calculateAndDisplayAggregatedStatistics() {
    const matches = document.querySelectorAll('.card');
    let matchesWon = 0;
    let matchesLost = 0;

    let totalSetsPlayed = 0;
    let totalSetsWon = 0;
    let totalTiebreaksPlayed = 0;
    let totalTiebreaksWon = 0;

    let totalPointsWon = 0;
    let totalPoints = 0;
    let totalServicePointsWon = 0;
    let totalServicePoints = 0;
    let totalReturnPointsWon = 0;
    let totalReturnPoints = 0;
    let totalGamesWon = 0;
    let totalGames = 0;
    let totalServiceGamesWon = 0;
    let totalServiceGames = 0;
    let totalReturnGamesWon = 0;
    let totalReturnGames = 0;
    let totalBreakPointsSaved = 0;
    let totalBreakPointsAgainst = 0;
    let totalBreakPointsConverted = 0;
    let totalBreakPointsFor = 0;

    let firstToLead = 0;
    let firstToLoss = 0;
    let firstToLeadEarly = 0;
    let firstToLeadLate = 0;
    let firstToLossEarly = 0;
    let firstToLossLate = 0;

    let counterBreakWins = 0;
    let counterBreakLosses = 0;

    matches.forEach(match => {
        const matchId = match.dataset.matchId;
        const matchWinnerElement = match.querySelector('.match-winner strong');

        if (matchWinnerElement) {
            const matchResult = matchWinnerElement.textContent;
            if (matchResult === 'Win') {
                matchesWon++;
            } else if (matchResult === 'Loss') {
                matchesLost++;
            }
        } else {
            console.error(`Elemento match-winner non trovato per il match ${matchId}`);
        }

        for (let setNumber = 1; setNumber <= 5; setNumber++) {
            const setStats = match.querySelector(`#set-stats-${matchId}-${setNumber}`);

            if (setStats) {
                const setResultText = setStats.querySelector('h3').textContent.split(': ')[1];

                if (setResultText.includes('Win')) {
                    totalSetsWon++;
                }
                totalSetsPlayed++;

                const tiebreakResultElement = Array.from(setStats.querySelectorAll('p')).find(p => p.textContent.includes('Tiebreak Result'));
                if (tiebreakResultElement) {
                    const tiebreakResultText = tiebreakResultElement.textContent.split(': ')[1];
                    if (tiebreakResultText.includes('Win')) {
                        totalTiebreaksWon++;
                    }
                    totalTiebreaksPlayed++;
                }

                try {
                    const pointsText = setStats.querySelector('p:nth-child(2)').textContent.split(':')[1].trim().split(' ')[0];
                    const servicePointsText = setStats.querySelector('p:nth-child(3)').textContent.split(':')[1].trim().split(' ')[0];
                    const returnPointsText = setStats.querySelector('p:nth-child(4)').textContent.split(':')[1].trim().split(' ')[0];
                    const gamesText = setStats.querySelector('p:nth-child(5)').textContent.split(':')[1].trim().split(' ')[0];
                    const serviceGamesText = setStats.querySelector('p:nth-child(6)').textContent.split(':')[1].trim().split(' ')[0];
                    const returnGamesText = setStats.querySelector('p:nth-child(7)').textContent.split(':')[1].trim().split(' ')[0];
                    const breakPointsSavedText = setStats.querySelector('p:nth-child(8)').textContent.split(':')[1].trim().split(' su ');
                    const breakPointsConvertedText = setStats.querySelector('p:nth-child(9)').textContent.split(':')[1].trim().split(' su ');

                    const points = pointsText.split('/');
                    const servicePoints = servicePointsText.split('/');
                    const returnPoints = returnPointsText.split('/');
                    const games = gamesText.split('/');
                    const serviceGames = serviceGamesText.split('/');
                    const returnGames = returnGamesText.split('/');
                    const breakPointsSaved = breakPointsSavedText[0];
                    const breakPointsAgainst = breakPointsSavedText[1];
                    const breakPointsConverted = breakPointsConvertedText[0];
                    const breakPointsFor = breakPointsConvertedText[1];

                    totalPointsWon += parseInt(points[0]);
                    totalPoints += parseInt(points[1]);
                    totalServicePointsWon += parseInt(servicePoints[0]);
                    totalServicePoints += parseInt(servicePoints[1]);
                    totalReturnPointsWon += parseInt(returnPoints[0]);
                    totalReturnPoints += parseInt(returnPoints[1]);
                    totalGamesWon += parseInt(games[0]);
                    totalGames += parseInt(games[1]);
                    totalServiceGamesWon += parseInt(serviceGames[0]);
                    totalServiceGames += parseInt(serviceGames[1]);
                    totalReturnGamesWon += parseInt(returnGames[0]);
                    totalReturnGames += parseInt(returnGames[1]);
                    totalBreakPointsSaved += parseInt(breakPointsSaved);
                    totalBreakPointsAgainst += parseInt(breakPointsAgainst);
                    totalBreakPointsConverted += parseInt(breakPointsConverted);
                    totalBreakPointsFor += parseInt(breakPointsFor);

                    const firstBreakElement = Array.from(setStats.querySelectorAll('p')).find(p => p.textContent.includes('First Break'));
                    const counterBreakElement = Array.from(setStats.querySelectorAll('p')).find(p => p.textContent.includes('Counter Break'));

                    if (firstBreakElement) {
                        const firstBreakText = firstBreakElement.textContent;
                        if (firstBreakText.includes('First to lead')) {
                            firstToLead++;
                            if (firstBreakText.includes('early')) {
                                firstToLeadEarly++;
                            } else if (firstBreakText.includes('late')) {
                                firstToLeadLate++;
                            }
                        } else if (firstBreakText.includes('First to loss')) {
                            firstToLoss++;
                            if (firstBreakText.includes('early')) {
                                firstToLossEarly++;
                            } else if (firstBreakText.includes('late')) {
                                firstToLossLate++;
                            }
                        }

                        if (counterBreakElement) {
                            const counterBreakText = counterBreakElement.textContent;
                            if (counterBreakText.includes('Controbreak win')) {
                                counterBreakWins++;
                            } else if (counterBreakText.includes('Controbreak loss')) {
                                counterBreakLosses++;
                            }
                        } else {
                            console.warn(`Elemento counterBreakElement non trovato per il match ${matchId}, set ${setNumber}`);
                        }
                    } else {
                        console.warn(`Elemento firstBreakElement non trovato per il match ${matchId}, set ${setNumber}`);
                    }

                } catch (error) {
                    console.error(`Errore nel parsing delle statistiche per il match ${match.dataset.matchId}`, error);
                }
            } else {
                console.warn(`Elemento set-stats-${match.dataset.matchId}-${setNumber} non trovato.`);
            }
        }
    });

    displayAggregatedStatistics(
        matchesWon, matchesLost, totalSetsPlayed, totalSetsWon, totalTiebreaksPlayed, totalTiebreaksWon, 
        totalPointsWon, totalPoints, totalServicePointsWon, totalServicePoints, totalReturnPointsWon, totalReturnPoints, 
        totalGamesWon, totalGames, totalServiceGamesWon, totalServiceGames, totalReturnGamesWon, totalReturnGames, 
        totalBreakPointsSaved, totalBreakPointsAgainst, totalBreakPointsConverted, totalBreakPointsFor, 
        firstToLead, firstToLoss, firstToLeadEarly, firstToLeadLate, firstToLossEarly, firstToLossLate, 
        counterBreakWins, counterBreakLosses
    );
}

function displayAggregatedStatistics(
    matchesWon, matchesLost, totalSetsPlayed, totalSetsWon, totalTiebreaksPlayed, totalTiebreaksWon, 
    totalPointsWon, totalPoints, totalServicePointsWon, totalServicePoints, totalReturnPointsWon, totalReturnPoints, 
    totalGamesWon, totalGames, totalServiceGamesWon, totalServiceGames, totalReturnGamesWon, totalReturnGames, 
    totalBreakPointsSaved, totalBreakPointsAgainst, totalBreakPointsConverted, totalBreakPointsFor, 
    firstToLead, firstToLoss, firstToLeadEarly, firstToLeadLate, firstToLossEarly, firstToLossLate, 
    counterBreakWins, counterBreakLosses
) {
    setTextContentSafely('matches-won', `Match Vinti: ${matchesWon}`);
    setTextContentSafely('matches-lost', `Match Persi: ${matchesLost}`);
    setTextContentSafely('total-sets-won', `Set Vinti: ${totalSetsWon}/${totalSetsPlayed}`);
    setTextContentSafely('total-tiebreaks-won', `Tiebreak Vinti: ${totalTiebreaksWon}/${totalTiebreaksPlayed}`);
    setTextContentSafely('total-points', `Points: ${totalPointsWon}/${totalPoints}`);
    setTextContentSafely('total-service-points', `Service Points: ${totalServicePointsWon}/${totalServicePoints}`);
    setTextContentSafely('total-return-points', `Return Points: ${totalReturnPointsWon}/${totalReturnPoints}`);
    setTextContentSafely('total-games', `Games: ${totalGamesWon}/${totalGames}`);
    setTextContentSafely('total-service-games', `Service Games: ${totalServiceGamesWon}/${totalServiceGames}`);
    setTextContentSafely('total-return-games', `Return Games: ${totalReturnGamesWon}/${totalReturnGames}`);
    setTextContentSafely('total-break-points-saved', `Break Points Saved: ${totalBreakPointsSaved} su ${totalBreakPointsAgainst}`);
    setTextContentSafely('total-break-points-converted', `Break Points Converted: ${totalBreakPointsConverted} su ${totalBreakPointsFor}`);
    setTextContentSafely('total-first-to-lead', `First to Lead: ${firstToLead}/${totalSetsPlayed} (early: ${firstToLeadEarly}, late: ${firstToLeadLate})`);
    setTextContentSafely('total-first-to-loss', `First to Loss: ${firstToLoss}/${totalSetsPlayed} (early: ${firstToLossEarly}, late: ${firstToLossLate})`);
    setTextContentSafely('total-counterbreak-win', `Counter Break Win: ${counterBreakWins}/${firstToLoss}`);
    setTextContentSafely('total-counterbreak-loss', `Counter Break Loss: ${counterBreakLosses}/${firstToLead}`);
}

function setTextContentSafely(elementId, textContent) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = textContent;
    } else {
        console.warn(`Elemento con ID ${elementId} non trovato.`);
    }
}

// Aggiunta dei listener agli eventi di caricamento della pagina per calcolare e visualizzare le statistiche
document.addEventListener('DOMContentLoaded', () => {
    calculateAndDisplayAggregatedStatistics();
});



function calculateAndDisplaySetStatistics(setNumber) {
    const matches = document.querySelectorAll('.card');
    let totalSetPlayed = 0;
    let totalSetWon = 0;
    let totalTiebreakPlayed = 0;
    let totalTiebreakWon = 0;

    let totalSetAfterWinPlayed = 0;
    let totalSetAfterWinWon = 0;
    let totalTiebreakAfterWinPlayed = 0;
    let totalTiebreakAfterWinWon = 0;

    let totalSetAfterLossPlayed = 0;
    let totalSetAfterLossWon = 0;
    let totalTiebreakAfterLossPlayed = 0;
    let totalTiebreakAfterLossWon = 0;

    let totalPointsWon = 0;
    let totalPoints = 0;
    let totalServicePointsWon = 0;
    let totalServicePoints = 0;
    let totalReturnPointsWon = 0;
    let totalReturnPoints = 0;
    let totalGamesWon = 0;
    let totalGames = 0;
    let totalServiceGamesWon = 0;
    let totalServiceGames = 0;
    let totalReturnGamesWon = 0;
    let totalReturnGames = 0;
    let totalBreakPointsSaved = 0;
    let totalBreakPointsAgainst = 0;
    let totalBreakPointsConverted = 0;
    let totalBreakPointsFor = 0;

    let totalPointsAfterWinWon = 0;
    let totalPointsAfterWin = 0;
    let totalServicePointsAfterWinWon = 0;
    let totalServicePointsAfterWin = 0;
    let totalReturnPointsAfterWinWon = 0;
    let totalReturnPointsAfterWin = 0;
    let totalGamesAfterWinWon = 0;
    let totalGamesAfterWin = 0;
    let totalServiceGamesAfterWinWon = 0;
    let totalServiceGamesAfterWin = 0;
    let totalReturnGamesAfterWinWon = 0;
    let totalReturnGamesAfterWin = 0;
    let totalBreakPointsAfterWinSaved = 0;
    let totalBreakPointsAfterWinAgainst = 0;
    let totalBreakPointsAfterWinConverted = 0;
    let totalBreakPointsAfterWinFor = 0;

    let totalPointsAfterLossWon = 0;
    let totalPointsAfterLoss = 0;
    let totalServicePointsAfterLossWon = 0;
    let totalServicePointsAfterLoss = 0;
    let totalReturnPointsAfterLossWon = 0;
    let totalReturnPointsAfterLoss = 0;
    let totalGamesAfterLossWon = 0;
    let totalGamesAfterLoss = 0;
    let totalServiceGamesAfterLossWon = 0;
    let totalServiceGamesAfterLoss = 0;
    let totalReturnGamesAfterLossWon = 0;
    let totalReturnGamesAfterLoss = 0;
    let totalBreakPointsAfterLossSaved = 0;
    let totalBreakPointsAfterLossAgainst = 0;
    let totalBreakPointsAfterLossConverted = 0;
    let totalBreakPointsAfterLossFor = 0;

    let firstToLead = 0;
    let firstToLoss = 0;
    let firstToLeadEarly = 0;
    let firstToLeadLate = 0;
    let firstToLossEarly = 0;
    let firstToLossLate = 0;

    let firstToLeadAfterWin = 0;
    let firstToLossAfterWin = 0;
    let firstToLeadEarlyAfterWin = 0;
    let firstToLeadLateAfterWin = 0;
    let firstToLossEarlyAfterWin = 0;
    let firstToLossLateAfterWin = 0;

    let firstToLeadAfterLoss = 0;
    let firstToLossAfterLoss = 0;
    let firstToLeadEarlyAfterLoss = 0;
    let firstToLeadLateAfterLoss = 0;
    let firstToLossEarlyAfterLoss = 0;
    let firstToLossLateAfterLoss = 0;

    let counterBreakWins = 0;
    let counterBreakLosses = 0;

    let counterBreakWinsAfterWin = 0;
    let counterBreakLossesAfterWin = 0;
    let counterBreakWinsAfterLoss = 0;
    let counterBreakLossesAfterLoss = 0;

    matches.forEach(match => {
        const setStats = match.querySelector(`#set-stats-${match.dataset.matchId}-${setNumber}`);

        if (setStats) {
            const setResultText = setStats.querySelector('h3').textContent.split(': ')[1];
            const prevSetResultText = setStats.querySelector('h3').textContent.split(' (Prev Set: ')[1].split(')')[0];

            if (setResultText.includes('Win')) {
                totalSetWon++;
                if (prevSetResultText === 'Win') {
                    totalSetAfterWinWon++;
                } else if (prevSetResultText === 'Loss') {
                    totalSetAfterLossWon++;
                }
            }
            totalSetPlayed++;
            if (prevSetResultText === 'Win') {
                totalSetAfterWinPlayed++;
            } else if (prevSetResultText === 'Loss') {
                totalSetAfterLossPlayed++;
            }

            const tiebreakResultElement = Array.from(setStats.querySelectorAll('p')).find(p => p.textContent.includes('Tiebreak Result'));
            if (tiebreakResultElement) {
                const tiebreakResultText = tiebreakResultElement.textContent.split(': ')[1];
                if (tiebreakResultText.includes('Win')) {
                    totalTiebreakWon++;
                    if (prevSetResultText === 'Win') {
                        totalTiebreakAfterWinWon++;
                    } else if (prevSetResultText === 'Loss') {
                        totalTiebreakAfterLossWon++;
                    }
                }
                totalTiebreakPlayed++;
                if (prevSetResultText === 'Win') {
                    totalTiebreakAfterWinPlayed++;
                } else if (prevSetResultText === 'Loss') {
                    totalTiebreakAfterLossPlayed++;
                }
            }

            try {
                const pointsText = setStats.querySelector('p:nth-child(2)').textContent.split(':')[1].trim().split(' ')[0];
                const servicePointsText = setStats.querySelector('p:nth-child(3)').textContent.split(':')[1].trim().split(' ')[0];
                const returnPointsText = setStats.querySelector('p:nth-child(4)').textContent.split(':')[1].trim().split(' ')[0];
                const gamesText = setStats.querySelector('p:nth-child(5)').textContent.split(':')[1].trim().split(' ')[0];
                const serviceGamesText = setStats.querySelector('p:nth-child(6)').textContent.split(':')[1].trim().split(' ')[0];
                const returnGamesText = setStats.querySelector('p:nth-child(7)').textContent.split(':')[1].trim().split(' ')[0];
                const breakPointsSavedText = setStats.querySelector('p:nth-child(8)').textContent.split(':')[1].trim().split(' su ');
                const breakPointsConvertedText = setStats.querySelector('p:nth-child(9)').textContent.split(':')[1].trim().split(' su ');

                const points = pointsText.split('/');
                const servicePoints = servicePointsText.split('/');
                const returnPoints = returnPointsText.split('/');
                const games = gamesText.split('/');
                const serviceGames = serviceGamesText.split('/');
                const returnGames = returnGamesText.split('/');
                const breakPointsSaved = breakPointsSavedText[0];
                const breakPointsAgainst = breakPointsSavedText[1];
                const breakPointsConverted = breakPointsConvertedText[0];
                const breakPointsFor = breakPointsConvertedText[1];

                totalPointsWon += parseInt(points[0]);
                totalPoints += parseInt(points[1]);
                totalServicePointsWon += parseInt(servicePoints[0]);
                totalServicePoints += parseInt(servicePoints[1]);
                totalReturnPointsWon += parseInt(returnPoints[0]);
                totalReturnPoints += parseInt(returnPoints[1]);
                totalGamesWon += parseInt(games[0]);
                totalGames += parseInt(games[1]);
                totalServiceGamesWon += parseInt(serviceGames[0]);
                totalServiceGames += parseInt(serviceGames[1]);
                totalReturnGamesWon += parseInt(returnGames[0]);
                totalReturnGames += parseInt(returnGames[1]);
                totalBreakPointsSaved += parseInt(breakPointsSaved);
                totalBreakPointsAgainst += parseInt(breakPointsAgainst);
                totalBreakPointsConverted += parseInt(breakPointsConverted);
                totalBreakPointsFor += parseInt(breakPointsFor);

                if (prevSetResultText === 'Win') {
                    totalPointsAfterWinWon += parseInt(points[0]);
                    totalPointsAfterWin += parseInt(points[1]);
                    totalServicePointsAfterWinWon += parseInt(servicePoints[0]);
                    totalServicePointsAfterWin += parseInt(servicePoints[1]);
                    totalReturnPointsAfterWinWon += parseInt(returnPoints[0]);
                    totalReturnPointsAfterWin += parseInt(returnPoints[1]);
                    totalGamesAfterWinWon += parseInt(games[0]);
                    totalGamesAfterWin += parseInt(games[1]);
                    totalServiceGamesAfterWinWon += parseInt(serviceGames[0]);
                    totalServiceGamesAfterWin += parseInt(serviceGames[1]);
                    totalReturnGamesAfterWinWon += parseInt(returnGames[0]);
                    totalReturnGamesAfterWin += parseInt(returnGames[1]);
                    totalBreakPointsAfterWinSaved += parseInt(breakPointsSaved);
                    totalBreakPointsAfterWinAgainst += parseInt(breakPointsAgainst);
                    totalBreakPointsAfterWinConverted += parseInt(breakPointsConverted);
                    totalBreakPointsAfterWinFor += parseInt(breakPointsFor);
                } else if (prevSetResultText === 'Loss') {
                    totalPointsAfterLossWon += parseInt(points[0]);
                    totalPointsAfterLoss += parseInt(points[1]);
                    totalServicePointsAfterLossWon += parseInt(servicePoints[0]);
                    totalServicePointsAfterLoss += parseInt(servicePoints[1]);
                    totalReturnPointsAfterLossWon += parseInt(returnPoints[0]);
                    totalReturnPointsAfterLoss += parseInt(returnPoints[1]);
                    totalGamesAfterLossWon += parseInt(games[0]);
                    totalGamesAfterLoss += parseInt(games[1]);
                    totalServiceGamesAfterLossWon += parseInt(serviceGames[0]);
                    totalServiceGamesAfterLoss += parseInt(serviceGames[1]);
                    totalReturnGamesAfterLossWon += parseInt(returnGames[0]);
                    totalReturnGamesAfterLoss += parseInt(returnGames[1]);
                    totalBreakPointsAfterLossSaved += parseInt(breakPointsSaved);
                    totalBreakPointsAfterLossAgainst += parseInt(breakPointsAgainst);
                    totalBreakPointsAfterLossConverted += parseInt(breakPointsConverted);
                    totalBreakPointsAfterLossFor += parseInt(breakPointsFor);
                }

                const firstBreakElement = Array.from(setStats.querySelectorAll('p')).find(p => p.textContent.includes('First Break'));
                const counterBreakElement = Array.from(setStats.querySelectorAll('p')).find(p => p.textContent.includes('Counter Break'));

                console.log(`Match ID: ${match.dataset.matchId}, Set Number: ${setNumber}`);
                console.log(`First Break Element: ${firstBreakElement ? firstBreakElement.textContent : 'Non trovato'}`);
                console.log(`Counter Break Element: ${counterBreakElement ? counterBreakElement.textContent : 'Non trovato'}`);

                if (firstBreakElement) {
                    const firstBreakText = firstBreakElement.textContent;
                    if (firstBreakText.includes('First to lead')) {
                        firstToLead++;
                        if (firstBreakText.includes('early')) {
                            firstToLeadEarly++;
                            if (prevSetResultText === 'Win') {
                                firstToLeadEarlyAfterWin++;
                            } else if (prevSetResultText === 'Loss') {
                                firstToLeadEarlyAfterLoss++;
                            }
                        } else if (firstBreakText.includes('late')) {
                            firstToLeadLate++;
                            if (prevSetResultText === 'Win') {
                                firstToLeadLateAfterWin++;
                            } else if (prevSetResultText === 'Loss') {
                                firstToLeadLateAfterLoss++;
                            }
                        }
                        if (prevSetResultText === 'Win') {
                            firstToLeadAfterWin++;
                        } else if (prevSetResultText === 'Loss') {
                            firstToLeadAfterLoss++;
                        }
                        if (counterBreakElement && counterBreakElement.textContent.includes('Controbreak loss')) {
                            counterBreakLosses++;
                            if (prevSetResultText === 'Win') {
                                counterBreakLossesAfterWin++;
                            } else if (prevSetResultText === 'Loss') {
                                counterBreakLossesAfterLoss++;
                            }
                        }
                    } else if (firstBreakText.includes('First to loss')) {
                        firstToLoss++;
                        if (firstBreakText.includes('early')) {
                            firstToLossEarly++;
                            if (prevSetResultText === 'Win') {
                                firstToLossEarlyAfterWin++;
                            } else if (prevSetResultText === 'Loss') {
                                firstToLossEarlyAfterLoss++;
                            }
                        } else if (firstBreakText.includes('late')) {
                            firstToLossLate++;
                            if (prevSetResultText === 'Win') {
                                firstToLossLateAfterWin++;
                            } else if (prevSetResultText === 'Loss') {
                                firstToLossLateAfterLoss++;
                            }
                        }
                        if (prevSetResultText === 'Win') {
                            firstToLossAfterWin++;
                        } else if (prevSetResultText === 'Loss') {
                            firstToLossAfterLoss++;
                        }
                        if (counterBreakElement && counterBreakElement.textContent.includes('Controbreak win')) {
                            counterBreakWins++;
                            if (prevSetResultText === 'Win') {
                                counterBreakWinsAfterWin++;
                            } else if (prevSetResultText === 'Loss') {
                                counterBreakWinsAfterLoss++;
                            }
                        }
                    }
                }

            } catch (error) {
                console.error(`Errore nel parsing delle statistiche per il match ${match.dataset.matchId}`, error);
            }
        } else {
            console.warn(`Elemento set-stats-${match.dataset.matchId}-${setNumber} non trovato.`);
        }
    });

    setTextContentSafely(`set${setNumber}-wins`, `${totalSetWon}/${totalSetPlayed}`);
    setTextContentSafely(`set${setNumber}-tiebreak-wins`, `Tiebreak Win: ${totalTiebreakWon}/${totalTiebreakPlayed}`);
    setTextContentSafely(`set${setNumber}-points`, `${totalPointsWon}/${totalPoints}`);
    setTextContentSafely(`set${setNumber}-service-points`, `${totalServicePointsWon}/${totalServicePoints}`);
    setTextContentSafely(`set${setNumber}-return-points`, `${totalReturnPointsWon}/${totalReturnPoints}`);
    setTextContentSafely(`set${setNumber}-games`, `${totalGamesWon}/${totalGames}`);
    setTextContentSafely(`set${setNumber}-service-games`, `${totalServiceGamesWon}/${totalServiceGames}`);
    setTextContentSafely(`set${setNumber}-return-games`, `${totalReturnGamesWon}/${totalReturnGames}`);
    setTextContentSafely(`set${setNumber}-break-points-saved`, `${totalBreakPointsSaved} su ${totalBreakPointsAgainst}`);
    setTextContentSafely(`set${setNumber}-break-points-converted`, `${totalBreakPointsConverted} su ${totalBreakPointsFor}`);
    setTextContentSafely(`set${setNumber}-first-to-lead`, `${firstToLead}/${totalSetPlayed} (early: ${firstToLeadEarly}, late: ${firstToLeadLate})`);
    setTextContentSafely(`set${setNumber}-first-to-loss`, `${firstToLoss}/${totalSetPlayed} (early: ${firstToLossEarly}, late: ${firstToLossLate})`);
    setTextContentSafely(`set${setNumber}-counterbreak-win`, `${counterBreakWins}/${firstToLoss}`);
    setTextContentSafely(`set${setNumber}-counterbreak-loss`, `${counterBreakLosses}/${firstToLead}`);

    if (setNumber === 2 || setNumber === 3) {
        // Statistiche per set 2 e 3 dopo vittoria
        setTextContentSafely(`set${setNumber}-after-win-wins`, `${totalSetAfterWinWon}/${totalSetAfterWinPlayed}`);
        setTextContentSafely(`set${setNumber}-after-win-tiebreak-wins`, `Tiebreak Win: ${totalTiebreakAfterWinWon}/${totalTiebreakAfterWinPlayed}`);
        setTextContentSafely(`set${setNumber}-after-win-points`, `${totalPointsAfterWinWon}/${totalPointsAfterWin}`);
        setTextContentSafely(`set${setNumber}-after-win-service-points`, `${totalServicePointsAfterWinWon}/${totalServicePointsAfterWin}`);
        setTextContentSafely(`set${setNumber}-after-win-return-points`, `${totalReturnPointsAfterWinWon}/${totalReturnPointsAfterWin}`);
        setTextContentSafely(`set${setNumber}-after-win-games`, `${totalGamesAfterWinWon}/${totalGamesAfterWin}`);
        setTextContentSafely(`set${setNumber}-after-win-service-games`, `${totalServiceGamesAfterWinWon}/${totalServiceGamesAfterWin}`);
        setTextContentSafely(`set${setNumber}-after-win-return-games`, `${totalReturnGamesAfterWinWon}/${totalReturnGamesAfterWin}`);
        setTextContentSafely(`set${setNumber}-after-win-break-points-saved`, `${totalBreakPointsAfterWinSaved} su ${totalBreakPointsAfterWinAgainst}`);
        setTextContentSafely(`set${setNumber}-after-win-break-points-converted`, `${totalBreakPointsAfterWinConverted} su ${totalBreakPointsAfterWinFor}`);
        setTextContentSafely(`set${setNumber}-after-win-first-to-lead`, `${firstToLeadAfterWin}/${totalSetAfterWinPlayed} (early: ${firstToLeadEarlyAfterWin}, late: ${firstToLeadLateAfterWin})`);
        setTextContentSafely(`set${setNumber}-after-win-first-to-loss`, `${firstToLossAfterWin}/${totalSetAfterWinPlayed} (early: ${firstToLossEarlyAfterWin}, late: ${firstToLossLateAfterWin})`);
        setTextContentSafely(`set${setNumber}-after-win-counterbreak-win`, `${counterBreakWinsAfterWin}/${firstToLossAfterWin}`);
        setTextContentSafely(`set${setNumber}-after-win-counterbreak-loss`, `${counterBreakLossesAfterWin}/${firstToLeadAfterWin}`);

        // Statistiche per set 2 e 3 dopo sconfitta
        setTextContentSafely(`set${setNumber}-after-loss-wins`, `${totalSetAfterLossWon}/${totalSetAfterLossPlayed}`);
        setTextContentSafely(`set${setNumber}-after-loss-tiebreak-wins`, `Tiebreak Win: ${totalTiebreakAfterLossWon}/${totalTiebreakAfterLossPlayed}`);
        setTextContentSafely(`set${setNumber}-after-loss-points`, `${totalPointsAfterLossWon}/${totalPointsAfterLoss}`);
        setTextContentSafely(`set${setNumber}-after-loss-service-points`, `${totalServicePointsAfterLossWon}/${totalServicePointsAfterLoss}`);
        setTextContentSafely(`set${setNumber}-after-loss-return-points`, `${totalReturnPointsAfterLossWon}/${totalReturnPointsAfterLoss}`);
        setTextContentSafely(`set${setNumber}-after-loss-games`, `${totalGamesAfterLossWon}/${totalGamesAfterLoss}`);
        setTextContentSafely(`set${setNumber}-after-loss-service-games`, `${totalServiceGamesAfterLossWon}/${totalServiceGamesAfterLoss}`);
        setTextContentSafely(`set${setNumber}-after-loss-return-games`, `${totalReturnGamesAfterLossWon}/${totalReturnGamesAfterLoss}`);
        setTextContentSafely(`set${setNumber}-after-loss-break-points-saved`, `${totalBreakPointsAfterLossSaved} su ${totalBreakPointsAfterLossAgainst}`);
        setTextContentSafely(`set${setNumber}-after-loss-break-points-converted`, `${totalBreakPointsAfterLossConverted} su ${totalBreakPointsAfterLossFor}`);
        setTextContentSafely(`set${setNumber}-after-loss-first-to-lead`, `${firstToLeadAfterLoss}/${totalSetAfterLossPlayed} (early: ${firstToLeadEarlyAfterLoss}, late: ${firstToLeadLateAfterLoss})`);
        setTextContentSafely(`set${setNumber}-after-loss-first-to-loss`, `${firstToLossAfterLoss}/${totalSetAfterLossPlayed} (early: ${firstToLossEarlyAfterLoss}, late: ${firstToLossLateAfterLoss})`);
        setTextContentSafely(`set${setNumber}-after-loss-counterbreak-win`, `${counterBreakWinsAfterLoss}/${firstToLossAfterLoss}`);
        setTextContentSafely(`set${setNumber}-after-loss-counterbreak-loss`, `${counterBreakLossesAfterLoss}/${firstToLeadAfterLoss}`);
    }
}

function calculateAndDisplayAllSetStatistics() {
    calculateAndDisplaySetStatistics(1);
    calculateAndDisplaySetStatistics(2);
    calculateAndDisplaySetStatistics(3);
    calculateAndDisplaySetStatistics(4);
    calculateAndDisplaySetStatistics(5);
}

window.calculateAndDisplayAggregatedStatistics = calculateAndDisplayAggregatedStatistics;
window.calculateAndDisplaySet1Statistics = calculateAndDisplaySetStatistics.bind(null, 1);
window.calculateAndDisplaySet2Statistics = calculateAndDisplaySetStatistics.bind(null, 2);
window.calculateAndDisplaySet3Statistics = calculateAndDisplaySetStatistics.bind(null, 3);
window.calculateAndDisplaySet4Statistics = calculateAndDisplaySetStatistics.bind(null, 4);
window.calculateAndDisplaySet5Statistics = calculateAndDisplaySetStatistics.bind(null, 5);
window.calculateAndDisplayAllSetStatistics = calculateAndDisplayAllSetStatistics;

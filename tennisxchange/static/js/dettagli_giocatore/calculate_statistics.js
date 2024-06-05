(function() {
    function calculateTiebreakWinner(tiebreak) {
        const scoreFirstPlayer = parseInt(tiebreak.score_first_player, 10);
        const scoreSecondPlayer = parseInt(tiebreak.score_second_player, 10);

        return scoreFirstPlayer > scoreSecondPlayer ? 'First Player' : 'Second Player';
    }

    function calculateSetWinnerFromHTML(matchId, setNumber) {
        const setScoreElement = document.querySelector(`.card[data-match-id="${matchId}"] .set-scores`);
        if (!setScoreElement) return 'Draw';
        
        const setScores = setScoreElement.innerText.match(/(\d+)-(\d+)/g);
        const setScore = setScores[setNumber - 1];
        const [scoreFirst, scoreSecond] = setScore.split('-').map(Number);

        return scoreFirst > scoreSecond ? 'Win' : (scoreSecond > scoreFirst ? 'Loss' : 'Draw');
    }

    function calculateMatchWinnerFromHTML(matchId) {
        const setScoreElement = document.querySelector(`.card[data-match-id="${matchId}"] .set-scores`);
        if (!setScoreElement) return 'Draw';
        
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

        return firstPlayerWins > secondPlayerWins ? 'Win' : 'Loss';
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
        let breakPointsAgainst = 0;
        let breakPointsFor = 0;
        let breakPointsSaved = 0;
        let breakPointsConverted = 0;
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
                    if (point.break_point === 'yes') {
                        if (game.player_served === 'First Player') {
                            setBreakPointsAgainst++;
                        } else {
                            setBreakPointsFor++;
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

    function calculateFirstBreakAndCounter(data) {
        return data.sets.map(set => {
            let firstBreak = null;
            let counterBreak = 'None';
            let breakLead = 0;
            let breakLoss = 0;
            let breaksFirstPlayer = 0;
            let breaksSecondPlayer = 0;
            let firstBreakFound = false;
            let firstBreakTiming = '';
    
            // Trova il primo break e aggiorna il conteggio dei break
            for (const [index, game] of set.games.entries()) {
                if (game.serve_lost) {
                    if (!firstBreakFound) {
                        firstBreak = game.serve_lost;
                        firstBreakFound = true;
                        if (firstBreak === 'First Player') {
                            breaksSecondPlayer++;
                        } else if (firstBreak === 'Second Player') {
                            breaksFirstPlayer++;
                        }
                        // Controlla se il primo break porta a un vantaggio o svantaggio
                        if (firstBreak === 'First Player') {
                            breakLoss = 1;
                        } else if (firstBreak === 'Second Player') {
                            breakLead = 1;
                        }
                        // Determina il timing del primo break
                        if (index < 4) {
                            firstBreakTiming = 'early';
                        } else if (index >= 8) {
                            firstBreakTiming = 'late';
                        }
                    } else {
                        if (game.serve_lost === 'First Player') {
                            breaksSecondPlayer++;
                        } else if (game.serve_lost === 'Second Player') {
                            breaksFirstPlayer++;
                        }
    
                        // Verifica se il break riporta il set in parità
                        if (firstBreak === 'First Player' && game.serve_lost === 'Second Player' && breaksFirstPlayer === breaksSecondPlayer) {
                            breakLead = 0;
                            counterBreak = 'Controbreak win';
                            break;
                        } else if (firstBreak === 'Second Player' && game.serve_lost === 'First Player' && breaksFirstPlayer === breaksSecondPlayer) {
                            breakLoss = 0;
                            counterBreak = 'Controbreak loss';
                            break;
                        }
                    }
                }
            }
    
            let firstBreakResult;
            if (firstBreak === 'First Player') {
                firstBreakResult = `First to loss${firstBreakTiming ? ' (' + firstBreakTiming + ')' : ''}`;
            } else if (firstBreak === 'Second Player') {
                firstBreakResult = `First to lead${firstBreakTiming ? ' (' + firstBreakTiming + ')' : ''}`;
            } else {
                firstBreakResult = 'None';
            }
    
            return {
                setNumber: set.set_number,
                firstBreak: firstBreakResult,
                counterBreak: counterBreak
            };
        });
    }
    

    // Esporta le funzioni nel contesto globale
    window.calculateTiebreakWinner = calculateTiebreakWinner;
    window.calculateSetWinnerFromHTML = calculateSetWinnerFromHTML;
    window.calculateMatchWinnerFromHTML = calculateMatchWinnerFromHTML;
    window.calculateAdvancedStatistics = calculateAdvancedStatistics;
    window.calculateGameStatistics = calculateGameStatistics;
    window.calculateBreakPoints = calculateBreakPoints;
    window.calculateFirstBreakAndCounter = calculateFirstBreakAndCounter;
})();

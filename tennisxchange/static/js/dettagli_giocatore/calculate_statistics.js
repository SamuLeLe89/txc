(function() {
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

    // Esporta le funzioni nel contesto globale
    window.calculateAdvancedStatistics = calculateAdvancedStatistics;
    window.calculateGameStatistics = calculateGameStatistics;
    window.calculateBreakPoints = calculateBreakPoints;
})();

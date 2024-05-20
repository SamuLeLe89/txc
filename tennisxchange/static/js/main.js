document.addEventListener('DOMContentLoaded', function () {
    const btnStats = document.getElementById('btn-stats');
    const btnPointByPoint = document.getElementById('btn-pointbypoint');
    const matchStats = document.getElementById('match-stats');
    const pointByPoint = document.getElementById('point-by-point');

    // Gestione della visualizzazione delle statistiche e del Point-by-Point
    btnStats.addEventListener('click', function () {
        matchStats.style.display = 'block';
        pointByPoint.style.display = 'none';
    });

    btnPointByPoint.addEventListener('click', function () {
        pointByPoint.style.display = 'block';
        matchStats.style.display = 'none';
        // Assicuriamo che il primo set sia visibile di default quando si visualizza per la prima volta
        const firstSetDetail = document.querySelector('.set-detail');
        const firstSetButton = document.querySelector('.btn-set');
        firstSetDetail.style.display = 'block';
        firstSetButton.classList.add('active');
    });

    // Gestione dei pulsanti per i set
    const setButtons = document.querySelectorAll('.btn-set');
    setButtons.forEach(button => {
        button.addEventListener('click', function () {
            const setNumber = this.getAttribute('data-set');
            const allSets = document.querySelectorAll('.set-detail');
            const allButtons = document.querySelectorAll('.btn-set');

            allSets.forEach(set => {
                set.style.display = 'none'; // Nasconde tutti i dettagli dei set
            });

            allButtons.forEach(btn => {
                btn.classList.remove('active'); // Rimuove la classe 'active' da tutti i pulsanti
            });

            const activeSet = document.getElementById('set-detail-' + setNumber);
            activeSet.style.display = 'block'; // Mostra solo il dettaglio del set selezionato
            this.classList.add('active'); // Aggiunge la classe 'active' al pulsante cliccato
        });
    });
});

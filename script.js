document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.querySelector('#startScreen');
    const gameScreen = document.querySelector('#gameScreen');
    const resultScreen = document.querySelector('#resultScreen');
    const grid = document.querySelector('#gameGrid');
    const timerHolder = document.querySelector('#timer');
    const attemptsHolder = document.querySelector('#attempts');
    const scoreHolder = document.querySelector('#score');
    const bestScoreHolder = document.querySelector('#bestScore');

    const difficulties = {
        easy: { columns: 4, pairs: 8, recordKey: 'memoryBestEasy' },
        medium: { columns: 6, pairs: 12, recordKey: 'memoryBestMedium' },
        hard: { columns: 6, pairs: 18, recordKey: 'memoryBestHard' }
    };

    const cardImages = [
        { name: 'Python', image: 'images/python.jpg' },
        { name: 'Node.js', image: 'images/node.svg' },
        { name: 'Java', image: 'images/java.jpg' },
        { name: 'C#', image: 'images/csharp.png' },
        { name: 'HTML5', image: 'images/html.png' },
        { name: 'CSS3', image: 'images/css.png' },
        { name: 'JavaScript', image: 'images/JavaScript.png' },
        { name: 'React', image: 'images/react.webp' },
        { name: 'Angular', image: 'images/angular.png' },
        { name: 'Vue.js', image: 'images/vue.png' },
        { name: 'PHP', image: 'images/php.webp' },
        { name: 'Ruby', image: 'images/ruby.webp' },
        { name: 'Kotlin', image: 'images/kotlin.png' },
        { name: '.NET', image: 'images/dotnet.webp' },
        { name: 'Docker', image: 'images/docker.png' },
        { name: 'MongoDB', image: 'images/mongodb.png' },
        { name: 'MySQL', image: 'images/mysql.png' },
        { name: 'GitLab', image: 'images/gitlab.png' }
    ];

    let selectedDifficulty = 'easy';
    let attempts = 0;
    let score = 0;
    let elapsedSeconds = 0;
    let timerInterval = null;
    let turnTimeout = null;
    let firstCard = null;
    let secondCard = null;
    let boardLocked = false;
    let matchedPairs = 0;

    document.querySelectorAll('.difficulty').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.difficulty').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            selectedDifficulty = button.dataset.difficulty;
            showBestScore();
        });
    });

    document.querySelector('#startButton').addEventListener('click', startGame);
    document.querySelector('#restartButton').addEventListener('click', startGame);
    document.querySelector('#menuButton').addEventListener('click', returnToMenu);
    document.querySelector('#playAgainButton').addEventListener('click', () => {
        resultScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        showBestScore();
    });

    function showBestScore() {
        const best = getBestScore();
        bestScoreHolder.textContent = best > 0 ? `${best} points` : 'No record yet';
    }

    function getBestScore() {
        const recordKey = difficulties[selectedDifficulty].recordKey;
        return Number(localStorage.getItem(recordKey)) || 0;
    }

    function startGame() {
        clearInterval(timerInterval);
        clearTimeout(turnTimeout);
        turnTimeout = null;

        const config = difficulties[selectedDifficulty];

        attempts = 0;
        score = 0;
        elapsedSeconds = 0;
        matchedPairs = 0;
        firstCard = null;
        secondCard = null;
        boardLocked = false;

        attemptsHolder.textContent = attempts;
        scoreHolder.textContent = score;
        timerHolder.textContent = '00:00';

        startScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');

        createBoard(config);
        startTimer();
    }

    function createBoard(config) {
        grid.replaceChildren();
        grid.style.gridTemplateColumns = `repeat(${config.columns}, minmax(0, 1fr))`;

        let pairs = [];

        for (let i = 0; i < config.pairs; i++) {
            pairs.push(cardImages[i % cardImages.length]);
        }

        let cards = [];
        pairs.forEach((card) => {
            cards.push(card, card);
        });
        cards = shuffle(cards);

        cards.forEach((cardInfo, index) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'card';
            card.dataset.cardName = cardInfo.name;
            card.dataset.cardImage = cardInfo.image;
            card.dataset.index = index;
            card.setAttribute('aria-label', 'Card face down');
            card.innerHTML = '<img class="card-back" src="images/placeholder.jpg" alt="Card back">';
            card.addEventListener('click', () => flipCard(card));
            grid.appendChild(card);
        });

    }

    function shuffle(cards) {
        const shuffledCards = [...cards];

        for (let i = shuffledCards.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [shuffledCards[i], shuffledCards[randomIndex]] =
                [shuffledCards[randomIndex], shuffledCards[i]];
        }

        return shuffledCards;
    }

    function flipCard(card) {
        if (boardLocked || card === firstCard || card.classList.contains('matched')) {
            return;
        }

        revealCard(card);

        if (firstCard === null) {
            firstCard = card;
            return;
        }

        secondCard = card;
        boardLocked = true;
        attempts++;
        attemptsHolder.textContent = attempts;

        if (firstCard.dataset.cardName === secondCard.dataset.cardName) {
            turnTimeout = setTimeout(() => {
                turnTimeout = null;
                checkMatch();
            }, 350);
        } else {
            turnTimeout = setTimeout(() => {
                turnTimeout = null;
                hideCards();
            }, 700);
        }
    }

    function returnToMenu() {
        clearInterval(timerInterval);
        clearTimeout(turnTimeout);
        turnTimeout = null;
        firstCard = null;
        secondCard = null;
        boardLocked = false;
        gameScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        showBestScore();
    }

    function checkMatch() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.disabled = true;
        secondCard.disabled = true;

        matchedPairs++;
        score += calculateMatchPoints();
        scoreHolder.textContent = score;

        resetTurn();

        if (matchedPairs === difficulties[selectedDifficulty].pairs) {
            finishGame();
        }
    }

    function hideCards() {
        hideCard(firstCard);
        hideCard(secondCard);
        resetTurn();
    }

    function revealCard(card) {
        card.classList.add('flipped');
        card.innerHTML = `<img src="${card.dataset.cardImage}" alt="${card.dataset.cardName}">`;
        card.setAttribute('aria-label', `${card.dataset.cardName} card`);
    }

    function hideCard(card) {
        card.classList.remove('flipped');
        card.innerHTML = '<img class="card-back" src="images/placeholder.jpg" alt="Card back">';
        card.setAttribute('aria-label', 'Card face down');
    }

    function resetTurn() {
        firstCard = null;
        secondCard = null;
        boardLocked = false;
    }

    function calculateMatchPoints() {
        switch (selectedDifficulty) {
            case 'medium':
                return 120;
            case 'hard':
                return 180;
            default:
                return 100;
        }
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            elapsedSeconds++;
            timerHolder.textContent = formatTime(elapsedSeconds);
        }, 1000);
    }

    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function finishGame() {
        clearInterval(timerInterval);

        const timeBonus = Math.max(0, 300 - elapsedSeconds * 2);
        const attemptsPenalty = attempts * 5;
        score = Math.max(0, score + timeBonus - attemptsPenalty);
        scoreHolder.textContent = score;

        const previousBest = getBestScore();
        const isNewRecord = score > previousBest;
        if (isNewRecord) {
            localStorage.setItem(difficulties[selectedDifficulty].recordKey, String(score));
        }

        document.querySelector('#resultTime').textContent = formatTime(elapsedSeconds);
        document.querySelector('#resultAttempts').textContent = attempts;
        document.querySelector('#resultScore').textContent = score;
        document.querySelector('#newRecord').classList.toggle('hidden', !isNewRecord);

        setTimeout(() => {
            gameScreen.classList.add('hidden');
            resultScreen.classList.remove('hidden');
        }, 450);
    }

    showBestScore();
});
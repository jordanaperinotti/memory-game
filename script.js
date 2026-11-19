document.addEventListener('DOMContentLoaded', () => {

    const cardsList = [
        {
            name: 'python',
            image: 'images/python.jpg'
        },
        {
            name: 'node',
            image: 'images/node.svg'
        },
        {
            name: 'java',
            image: 'images/java.jpg'
        },
        {
            name: 'c',
            image: 'images/c.png'
        },

    ];
    cardsList.sort(() => 0.5 - Math.random());
    const grid = document.querySelector('.gameGrid');
    const attempstHolder = document.querySelector('.attemptsHolder');
    const foundHolder = document.querySelector('.foundHolder');
    const cardsInGame = 4;

    let attempts = 0;
    let foundCards = 0;
    attempstHolder.textContent = attempts;
    foundHolder.textContent = foundCards;

    let choseCards = [];
    let choseCardsIds = [];

    function initiateBoard() {
        for (let i = 0; i < cardsList.length; i++) {
            let card = document.createElement('img');
            card.setAttribute('src', 'images/placeholder.png');
            card.setAttribute('data-id', i);
            card.addEventListener('click', flipCard);
            grid.appendChild(card);
        }
    }

    function flipCard() {
        let cardId = this.getAttribute('data-id');
        if (this.getAttribute('src') != 'images/blank.png') {
            choseCards.push;
        }
    }

    initiateBoard();
})
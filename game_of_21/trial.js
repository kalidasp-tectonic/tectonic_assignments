const startBtn = document.getElementById("start-game");
const timerBtn = document.getElementById("set-timer");
const timerDisplay = document.getElementById("timer-display");
const timerText = document.getElementById("timer-text");
const addPlayer = document.querySelector("#add-player");
const rightSide = document.querySelector(".right-side");
let addPlayerCount = 3;
let deckId = null;
let timerDuration = 0; //timer duration (set by the user)
let timer; //timer reference and...
let countdownInterval; //timer interval reference
let currentPlayerIndex = 0;
let hitBtn = [];
let standBtn = [];
let playersFinished = 0; 

addPlayer.onclick = () => {
    const newPlayer = document.createElement("div");
    const playerClass = "player-" + addPlayerCount;
    newPlayer.classList.add("player", playerClass);

    newPlayer.innerHTML = `
    <div class="buttons2">
      <button id="hit-${addPlayerCount}" class="hit" style="display: none;">HIT</button>
      <button id="stand-${addPlayerCount}" class="stand" style="display: none;">STAND</button>
    </div>
    <div class="score"><div class="number">0</div></div>
    <div class="hand"></div>
  `;

    rightSide.appendChild(newPlayer);
    addPlayerCount++;

    updateButtonLists();
};

timerBtn.onclick = () => {
    const input = prompt("Set the timer duration (in seconds):");
    timerDuration = parseInt(input, 10) || 0; //parse the input from prompt, default to 0 if invalid
    timerBtn.style.display = "none"; 
};

// Start Button
startBtn.onclick = async () => {
    updateButtonLists();

    addPlayer.style.display = "none";

    hitBtn.forEach(btn => btn.style.display = "none");
    standBtn.forEach(btn => btn.style.display = "none");

    //show buttons for the first player only (defined in prev html as ids for all, so this didnt work)
    if (hitBtn.length > 0) {
        hitBtn[0].style.display = "block";
        standBtn[0].style.display = "block";
    }

    const newDeck = "https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1";
    await getDeck(newDeck);

    const allPlayers = document.querySelectorAll(".player");

    for (const element of allPlayers) {
        if (deckId) {
            const hand = element.querySelector(".hand");
            const drawnCards = await initDraw();

            const card1 = drawnCards.cards;

            //add card images 
            const img1 = document.createElement("img");
            const img2 = document.createElement("img");
            img1.src = card1[0].image;
            img1.width = 150;
            img2.width = 150;
            img2.src = card1[1].image;
            hand.appendChild(img1);
            hand.appendChild(img2);

            const totalStr = element.querySelector(".number");

            const newNo1 = calculateScore(card1[0].value, 0);
            const newNo2 = calculateScore(card1[1].value, newNo1);

            totalStr.textContent = newNo2;
        }
    }

    startBtn.style.display = "none";

    if (timerDuration > 0) {
        startPlayerTimer();
    }
};

//update the hitBtn and standBtn lists to accomodate new players
function updateButtonLists() {
    hitBtn = document.querySelectorAll(".hit");
    standBtn = document.querySelectorAll(".stand");
}

//what to do when hit/stand is pressed
document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('hit')) {
        const element = event.target;
        const playerIndex = Array.from(hitBtn).indexOf(element);

        resetPlayerTimer();

        const hand1 = element.parentElement.parentElement.querySelector(".hand");
        const drawnCards = await draw();

        const card1 = drawnCards.cards[0];
        const img = document.createElement("img");
        img.src = card1.image;
        img.width = 150;
        hand1.appendChild(img);

        const totalStr1 = element.parentElement.parentElement.querySelector(".number");
        const scoreText1 = totalStr1.textContent;
        const currentNo = parseInt(scoreText1);

        const newNo = calculateScore(card1.value, currentNo);
        totalStr1.textContent = newNo;

        if (newNo === 'YOU BUSTED') {
            hitBtn[playerIndex].style.display = "none";
            standBtn[playerIndex].style.display = "none";

            playersFinished++;

            moveToNextPlayer();
        }
    }

    if (event.target.classList.contains('stand')) {
        const element = event.target;
        const playerIndex = Array.from(standBtn).indexOf(element);

        //reset timer when stand is pressed and then hide current hit/stand buttons
        resetPlayerTimer();

        hitBtn[playerIndex].style.display = "none";
        standBtn[playerIndex].style.display = "none";

        playersFinished++;

        moveToNextPlayer();
    }
});

async function getDeck(x) {
    const response = await fetch(x);
    const deckDetails = await response.json();
    deckId = deckDetails.deck_id;
}

async function initDraw() {
    const initCards = `https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`;
    const response = await fetch(initCards);
    const cards = await response.json();
    return cards;
}

async function draw() {
    const initCards = `https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`;
    const response = await fetch(initCards);
    const cards = await response.json();
    return cards;
}

function calculateScore(cardValue, oldValue) {
    let result;
    if (['KING', 'QUEEN', 'JACK'].includes(cardValue)) {
        result = 10 + oldValue;
    } else if (cardValue === 'ACE') {
        result = 11 + oldValue;
    } else {
        result = parseInt(cardValue) + oldValue;
    }

    if (result > 21) {
        result = 'YOU BUSTED';
    }
    
    return result;
}

function moveToNextPlayer() {
    currentPlayerIndex++;
    if (currentPlayerIndex < hitBtn.length) {
        hitBtn[currentPlayerIndex].style.display = "block";
        standBtn[currentPlayerIndex].style.display = "block";
        startPlayerTimer(); //start timer for the NEXT player
    } else {
        //return results when players are done playing
        if (playersFinished >= hitBtn.length) {
            returnResults();
        }
    }
}

function returnResults() {
    const allPlayers = document.querySelectorAll(".player");

    let maxScore = 0;
    const playerScores = {};

    //to find the highest score
    allPlayers.forEach(player => {
        const scoreElement = player.querySelector(".number");
        const score = scoreElement.textContent;

        if (score !== "YOU BUSTED") {
            const numericScore = parseInt(score);
            if (numericScore > maxScore && numericScore <= 21) {
                maxScore = numericScore;
            }
            playerScores[player] = numericScore;
        }
    });

    //to find out players with highest score
    const winners = [];
    allPlayers.forEach(player => {
        const scoreElement = player.querySelector(".number");
        const score = scoreElement.textContent;

        if (score == maxScore) {
            winners.push(player);
        }
    });

    //final results
    alert("Players who scored " + maxScore + " win!");
}

function startPlayerTimer() {
    if (timer) {
        clearTimeout(timer); //clear any existing timer so that a new timer can start
    }

    if (countdownInterval) {
        clearInterval(countdownInterval); //do the same with countdown
    }

    timerDisplay.style.display = "block"; 
    let remainingTime = timerDuration;

    countdownInterval = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(countdownInterval); 
            timerDisplay.style.display = "none"; //clear countdown and hide it 

            //player stand if the timer expires
            const currentPlayerHitBtn = hitBtn[currentPlayerIndex];
            const currentPlayerStandBtn = standBtn[currentPlayerIndex];
            
            if (currentPlayerHitBtn && currentPlayerStandBtn) {
                currentPlayerHitBtn.style.display = "none";
                currentPlayerStandBtn.style.display = "none";
            }

            moveToNextPlayer();
        } else {
            timerText.textContent = `Time Left: ${remainingTime}s`;
            remainingTime--;
        }
    }, 1000); //update every second
}

//teset the timer for the current player
function resetPlayerTimer() {
    if (countdownInterval) {
        clearInterval(countdownInterval); // clearing any countdown interval
    }

    //restarting timer
    startPlayerTimer();
}

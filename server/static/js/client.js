const socket = io();
const span = document.getElementsByClassName("close")[0];
const closeRules = document.querySelector(".close2");
const loginScreen = document.querySelector(".login");
const roomFullSection = document.querySelector(".roomFull");
const rooms = document.getElementsByName("room");
const chatScreen = document.querySelector(".chat");
const loginForm = document.querySelector(".loginForm");
const playerInfo = document.querySelector(".playerInfo");
const nickname = document.getElementById("nickname");
const messageList = document.getElementById("messages");
const cardsSection = document.querySelector(".cards");
const gameField = document.querySelector(".gameField");
const turn = document.querySelector(".turn");
const startButton = document.querySelector(".start");
const toepButton = document.querySelector(".toep");
const rulesButton = document.querySelector(".rulesButton");
const rulesPopup = document.querySelector(".rulesPopup");
const toepMessage = document.querySelector(".toepMessage");
const joinToepButton = document.querySelector(".joinToep");
const foldToepButton = document.querySelector(".foldToep");
const pointsDisplay = document.querySelector(".points");
const leaveButton = document.querySelector(".leave");
const popup = document.getElementById("myModal");
const winnerPopup = document.getElementById("winner-popup");
const winnerMessage = document.getElementById("winnerMessage");
let players;
let currentRoom;
let points = 0;
let noti;
let myCards;

startButton.disabled = true;
// const room = 'game'

// appendMessage('You joined')

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  socket.emit("send-nickname", nickname.value);

  rooms.forEach((button) => {
    if (button.checked === true) {
      socket.emit("room", button.value);
      currentRoom = button.value;
    }
  });

  //get the radio button value that is chosen

  // socket.emit('room', room.value)
  loginScreen.style.display = "none";
  gameField.style.display = "block";
  playerInfo.style.opacity = 1;
});

socket.on("full", (msg) => {
  roomFullSection.style.display = "block";
  gameField.style.display = "none";
});

socket.on("player", (msg, name) => {
  players = msg.players;

  console.log("curr player: ", msg.player);

  turn.innerHTML = "Your name: " + name;
  pointsDisplay.textContent = points;

  if (players >= 2) {
    startButton.disabled = false;

    startButton.addEventListener("click", startGame);
  }

  console.log(players);
});

socket.on("your turn", (msg) => {
  console.log("the message: ", msg);

  noti = msg;

  turn.textContent = noti;

  const cardsInHand = document.querySelectorAll(".card");

  console.log(cardsInHand);

  const onClick = function () {
    findCard(this, myCards);
    // console.log(this)
    cardsInHand.forEach((card) => {
      card.removeEventListener("click", onClick);
    });
  };

  cardsInHand.forEach((card) => {
    card.addEventListener("click", onClick);
  });
});

socket.on("toep popup", (msg) => {
  // console.log(msg)
  // alert(msg)

  popup.style.display = "block";
  toepMessage.textContent = msg;

  joinToepButton.addEventListener("click", () => {
    socket.emit("join toep", currentRoom);
    popup.style.display = "none";
  });

  foldToepButton.addEventListener("click", () => {
    socket.emit("fold toep", currentRoom);
    popup.style.display = "none";
  });
});

socket.on("deal cards", (cards, turn) => {
  // socket.on('pass turn', (player) => console.log('rukkeee:', player))

  toepButton.disabled = false;
  toepButton.addEventListener("click", toep);

  myCards = cards;

  cards.cards.forEach((card) => {
    appendCard(cardsSection, card.image, "card");
  });
});

socket.on("show played card", (card, cards) => {
  console.log("clicked card: ", card);
  //Now append the card to the playfield

  appendCard(gameField, card.image, "playedCard");
});

socket.on("winner", (winner) => {
  console.log("the winner is: ", winner);

  // appendMessage(winner, 'winnerMessage')
});

socket.on("game over", (msg) => {
  // gameField.innerHTML = ''

  gameField.innerHTML = "";
  cardsSection.innerHTML = "";
  console.log(msg);

  winnerMessage.textContent = msg;
  winnerPopup.style.display = "block";

  span.addEventListener("click", () => (winnerPopup.style.display = "none"));

  // popup.style.display = "block";
  // toepMessage.textContent = msg

  socket.emit("next round", currentRoom);
});

socket.on("round winner", (msg) => {
  console.log(msg);
});

socket.on("points", (number) => {
  pointsDisplay.textContent = number;

  console.log(number);
});

socket.on("started already", (msg) => {
  playerInfo.style.display = "none";
  roomFullSection.style.display = "block";
  console.log(msg);
});

rulesButton.addEventListener("click", () => {
  rulesPopup.style.display = "block";
  closeRules.addEventListener(
    "click",
    () => (rulesPopup.style.display = "none")
  );
});

function appendMessage(message, classToBeAdded) {
  let li = document.createElement("li");
  li.className = classToBeAdded;
  li.appendChild(document.createTextNode(message));

  messageList.appendChild(li);
}

function appendCard(section, source, classToBeAdded) {
  let cardImage = document.createElement("img");

  cardImage.src = source;

  cardImage.className = classToBeAdded;

  section.appendChild(cardImage);
}

function removeCard() {}

function findCard(ev, cards) {
  // console.log(ev)
  console.log("cards: ", cards);

  const clickedCard = ev.src;

  const foundCard = findCardInArray(cards, clickedCard);

  socket.emit("clicked card", foundCard, cards, currentRoom);

  turn.textContent = "";

  ev.remove();
}

function findCardInArray(array, cardToBeFound) {
  return (foundCard = array.cards.find((card) => card.image === cardToBeFound));
}

function startGame() {
  socket.emit("play", currentRoom);
  // socket.emit('game started', currentRoom)
  startButton.removeEventListener("click", startGame);
  startButton.disabled = true;
}

function toep() {
  socket.emit("toep", "er word getoept", currentRoom);
  toepButton.removeEventListener("click", toep);
  toepButton.disabled = true;
}

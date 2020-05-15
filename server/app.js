require("dotenv").config();
const nunjucks = require("nunjucks");
const router = require("./routes/router.js");
const path = require("path");
const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const Api = require("./modules/api.js");
const Data = require("./modules/data.js");
const Game = require("./modules/game.js");

nunjucks.configure(`${__dirname}/view/pages`, {
  autoescape: true,
  express: app,
});

// Api.getNewCardDeck()
//     .then(getNewCardDeck => gameMaker(getNewCardDeck));

let games = Array(4);

async function fillGamesArray() {
  //source: https://home.aveek.io/blog/post/making-an-online-chess-website-with-socketio/
  for (let i = 0; i < 4; i++) {
    games[i] = {
      players: 0,
      pid: [0, 0, 0, 0],
      deck: {},
      started: false,
      turn: 0,
      currentTurn: 0,
      toeps: 0,
      playerList: [
        {
          id: "",
          name: "",
          playedCards: [],
          points: 0,
          roundWinner: false,
          multiplier: 0,
        },
        {
          id: "",
          name: "",
          playedCards: [],
          points: 0,
          roundWinner: false,
          multiplier: 0,
        },
        {
          id: "",
          name: "",
          playedCards: [],
          points: 0,
          roundWinner: false,
          multiplier: 0,
        },
        {
          id: "",
          name: "",
          playedCards: [],
          points: 0,
          roundWinner: false,
          multiplier: 0,
        },
      ],
    };
    games[i].deck = await Api.getNewCardDeck();
  }
}

fillGamesArray();

async function shuffleCards(id) {
  const shuffledCards = await Api.shuffleCards(id);

  return shuffledCards;
}

function allCardsPlayed(arrLength) {
  return arrLength === 4;
}

function firstCardPlayed(arrLength) {
  return arrLength === 1;
}

function secondCardPlayed(arrLength) {
  return arrLength === 2;
}

function thirdCardPlayed(arrLength) {
  return arrLength === 3;
}

function next_turn(obj, socket) {
  //source: https://stackoverflow.com/questions/42107359/passing-turns-with-socket-io-and-nodejs-in-turn-based-game

  const players = obj.pid.filter((id) => id !== 0);

  const playerList = obj.playerList.filter((player) => player.id !== "");

  obj.turn = ++obj.currentTurn % players.length;

  console.log("its, this players turn now : ", players[obj.turn]);

  socket
    .to(players[obj.turn])
    .emit("your turn", `it's your turn ${playerList[obj.turn].name}`);
}

function findHighestCard(arr) {
  return arr.map((player) =>
    player.playedCards.map((cards) => {
      return {
        suit: cards.suit,
        value: cards.value,
      };
    })
  );
}

function findPlayer(array, socketId) {
  return array.find((player) => player.id == socketId);
}

function findLastRoundWinner(array, bool) {
  return array.find((player) => player.roundWinner == bool);
}

app
  .use(express.static(path.join(__dirname, "static")))
  .get("/", router.homeRoute);

// function gameMaker(deck) {
io.on("connection", async (socket) => {
  //step1: first make a room
  // console.log('soccket: ', socket)
  const playerId = socket.id;

  console.log(playerId + " connected");

  socket.on("send-nickname", (nickname) => {
    // Taking turns
    // players.push({ id: socket.id, name: nickname, playedCards: [], points: 0, roundWinner: false});
    // console.log(users)

    socket.on("room", async (room) => {
      console.log("room: ", room);

      socket.join(room);

      if (games[room].players < 4) {
        games[room].players++;
        games[room].pid[games[room].players - 1] = playerId;
        games[room].playerList[games[room].players - 1].id = playerId;
        games[room].playerList[games[room].players - 1].name = nickname;
      } // else emit the full event
      else {
        socket.emit("full", "This room is full", room);
        return;
      }
      if (games[room].started === true) {
        socket.emit("started already", "already started playing");
      }
      console.log(games[room]);
      players = games[room].players;

      const player = findPlayer(games[room].playerList, socket.id);

      socket.emit("player", { playerId, players, room }, player.name);
    });
  });

  socket.on("play", (room) => {
    socket.broadcast.emit("play", room);
    games[room].started = true;

    console.log("ready " + room);
    let players = games[room].pid.filter((id) => id !== 0);

    async function deal() {
      for (const [index, playerId] of players.entries()) {
        // const drawnCards = await Api.drawCards(games[room].deck.deck_id, 4)
        console.log("for of loop: ", index, playerId);

        const drawnCards = await Api.drawCards(games[room].deck.deck_id, 4);

        const transformedCards = Data.transformCardValues(drawnCards);

        io.to(playerId).emit("deal cards", transformedCards);
      }
      // next_turn(games[room], socket)
      socket.to(players[0]).emit("your turn", "first turn is for you");
    }
    deal();
  });

  socket.on("toep", (msg, room) => {
    const toeper = findPlayer(games[room].playerList, socket.id);
    toeper.multiplier++;
    // console.log(toeper)

    socket.to(room).emit("toep popup", `${toeper.name} toept, ga je mee?`);

    // console.log(toeper)
  });

  socket.on("join toep", (room) => {
    const toepJoiner = findPlayer(games[room].playerList, socket.id);

    toepJoiner.multiplier++;
  });

  socket.on("fold toep", (room) => {
    const toepFolder = findPlayer(games[room].playerList, socket.id);

    toepFolder.roundWinner = false;

    const players = games[room].playerList.filter(
      (player) => player.name !== ""
    );

    toepFolder.points++;

    io.to(toepFolder.id).emit("points", toepFolder.points);

    if (players.length === 2) {
      const winner = players.find((player) => player.id !== toepFolder.id);

      players.map((player) => {
        player.multiplier = 0;
        player.roundWinner = false;
      });

      io.in(room).emit(
        "game over",
        `${winner.name}, won this game. Get ready for the next one!`
      );
    }
  });

  socket.on("clicked card", async (playedCard, cards, room) => {
    //logs the card that has been played
    //in order to erase the card from the deck this card has to be found in the card deck

    // i need the room number
    // socket id
    let players = games[room].playerList.filter((player) => player.id !== "");

    const player = findPlayer(players, socket.id);

    player.playedCards.push(playedCard);

    io.in(room).emit("show played card", playedCard);

    console.log("PLAYAA: ", player);

    let values = findHighestCard(players);

    console.log(values);

    if (
      values.every((value) => firstCardPlayed(value.length)) === false &&
      values.every((value) => secondCardPlayed(value.length)) === false &&
      values.every((value) => thirdCardPlayed(value.length)) === false
    ) {
      console.log("SOCKET ID COMP FALSE NUMER 1111111111");

      next_turn(games[room], socket);
    }

    let firstRoundWinner;
    let secondRoundWinner;
    let thirdRoundWinner;
    let fourthRoundWinner;

    //if values.length === players.length
    console.log("VAAALUES: ", values);
    console.log("VAAALUES: ", values[1].length);
    console.log(values.every((value) => firstCardPlayed(value.length)));

    if (values.every((value) => firstCardPlayed(value.length)) === true) {
      console.log("valuessssss");
      // console.log(value)

      const firstPlayedCards = values.map((card) => card[0]);

      console.log(values[0][0]);

      firstRoundWinner = Game.findRoundWinner(
        values[0][0],
        firstCardPlayed,
        firstPlayedCards,
        0,
        players
      );
      console.log("Round 1 WINNERRR", firstRoundWinner);
      io.to(firstRoundWinner.id).emit("your turn", `You won this round!!`);
    }

    if (
      players.length === 2 &&
      players.every((player) => firstCardPlayed(player.playedCards.length)) ===
        false &&
      players.every((player) => secondCardPlayed(player.playedCards.length)) ===
        false &&
      players.every((player) => thirdCardPlayed(player.playedCards.length)) ===
        false &&
      players.every((player) => allCardsPlayed(player.playedCards.length)) ===
        false
    ) {
      //&& games[room].pid[games[room].turn] === players[games[room].turn].id
      console.log("SOCKET ID COMP false NRRR 222222");
      console.log(games[room].pid[games[room].turn]);
      console.log(players[games[room].turn].id);
      if (games[room].pid[games[room].turn] === socket.id) {
        next_turn(games[room], socket);
      }
    }
    if (
      players.length > 2 &&
      players.every((player) => firstCardPlayed(player.playedCards.length)) ===
        false &&
      players.every((player) => secondCardPlayed(player.playedCards.length)) ===
        false &&
      players.every((player) => thirdCardPlayed(player.playedCards.length)) ===
        false &&
      games[room].pid[games[room].turn] === socket.id
    ) {
      console.log("SOCKET ID COMP false NRRR 222222");

      next_turn(games[room], socket);
    }

    console.log(
      "2 cards have been played by every player",
      values.every((value) => secondCardPlayed(value.length)) === true
    );

    if (values.every((value) => secondCardPlayed(value.length)) === true) {
      const secondPlayedCards = values.map((card) => card[1]);

      const lastRoundWinner = findLastRoundWinner(players, true);

      const latsPlayedCardRoundWinner = lastRoundWinner.playedCards[1];

      const cardToCheck = secondPlayedCards.find(
        (card) =>
          card.suit === latsPlayedCardRoundWinner.suit &&
          card.value === latsPlayedCardRoundWinner.value
      );

      console.log("THE CARD THAT SHOULD BE CHECKED FIRST ::::", cardToCheck);
      console.log(
        "THE CARD THAT SHOULD BE CHECKED FIRST ::::",
        lastRoundWinner
      );

      // second played cards needs to be passed to the function
      secondRoundWinner = Game.findRoundWinner(
        cardToCheck,
        secondCardPlayed,
        secondPlayedCards,
        1,
        players
      );
      console.log("Round 2 WINNERRR", secondRoundWinner);

      //when the last round winner wins cards get played double...

      io.to(secondRoundWinner.id).emit("your turn", `You won second round!!`);
    }

    if (values.every((value) => thirdCardPlayed(value.length)) === true) {
      // console.log('valuessssss 2222')
      // check which array has a item first

      console.log(
        "==================THIRD ROUND WAS FINSHED===================="
      );

      const thirdPlayedCards = values.map((card) => card[2]);

      console.log(thirdPlayedCards);

      const lastRoundWinner = findLastRoundWinner(players, true);

      const latsPlayedCardRoundWinner = lastRoundWinner.playedCards[2];

      const cardToCheck = thirdPlayedCards.find(
        (card) =>
          card.suit === latsPlayedCardRoundWinner.suit &&
          card.value === latsPlayedCardRoundWinner.value
      );

      console.log("THE CARD THAT SHOULD BE CHECKED FIRST ::::", cardToCheck);

      thirdRoundWinner = Game.findRoundWinner(
        cardToCheck,
        thirdCardPlayed,
        thirdPlayedCards,
        2,
        players
      );
      console.log("Round 3 WINNERRR", thirdRoundWinner);
      io.to(thirdRoundWinner.id).emit("your turn", `You won third round!!`);
    }

    console.log(
      "ALL PLAYERS LAYED 4 CARDS DWON : ",
      players.every((player) => allCardsPlayed(player.playedCards.length))
    );
    players.map((player) =>
      console.log("true card legth: ", player.playedCards.length)
    );
    //   // check if everyone played 4 cards
    if (
      players.every((player) => allCardsPlayed(player.playedCards.length)) ===
      true
    ) {
      // this is what happens when everyone played his last card
      //Math.max?

      console.log(
        "==================FOURTH ROUND WAS FINSHED===================="
      );

      const fourthPlayedCards = values.map((card) => card[3]);

      console.log("4th card: ", fourthPlayedCards);

      const lastRoundWinner = findLastRoundWinner(players, true);

      const latsPlayedCardRoundWinner = lastRoundWinner.playedCards[3];

      const cardToCheck = fourthPlayedCards.find(
        (card) =>
          card.suit === latsPlayedCardRoundWinner.suit &&
          card.value === latsPlayedCardRoundWinner.value
      );

      console.log("THE CARD THAT SHOULD BE CHECKED FIRST ::::", cardToCheck);

      fourthRoundWinner = Game.findRoundWinner(
        cardToCheck,
        allCardsPlayed,
        fourthPlayedCards,
        3,
        players
      );
      console.log("Round 4 WINNERRR", fourthRoundWinner);

      fourthRoundWinner.multiplier = 0;

      const losers = players.filter(
        (players) => players.id !== fourthRoundWinner.id
      );

      losers.map((loser) => {
        loser.points = loser.points + 1 + loser.multiplier;
        loser.multiplier = 0;
      });

      console.log(players);

      io.in(room).emit(
        "game over",
        `${fourthRoundWinner.name}, won this game. Get ready for the next one!`
      );

      const player = findPlayer(games[room].playerList, socket.id);

      io.to(player.id).emit("points", player.points);

      players.forEach((player) => (player.playedCards = []));
    }
  });

  socket.on("next round", async (room) => {
    const shuffledCards = await shuffleCards(games[room].deck.deck_id);

    const newCards = await Api.drawCards(shuffledCards.deck_id, 4);

    const transformedNewCards = Data.transformCardValues(newCards);

    console.log(transformedNewCards);

    await io.to(socket.id).emit("deal cards", transformedNewCards);

    socket.to(games[room].pid[0]).emit("your turn", "first turn is for you");
  });

  // when the user disconnects from the server, remove him from the game room
  socket.on("disconnect", () => {
    for (let i = 0; i < 4; i++) {
      if (games[i].pid[0] == playerId || games[i].pid[1] == playerId)
        games[i].players--;
    }
    console.log(playerId + " disconnected");
  });
});
// }

server.listen(port, () => {
  console.log(`Dev app listening on port: ${port}`);
});

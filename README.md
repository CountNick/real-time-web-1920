# Tjoep!🃏

![Tjoep](https://user-images.githubusercontent.com/47485018/81940728-2f869a80-95f8-11ea-9786-f4650e0de2c1.png)


## Introduction
Mijn vrienden en ik toepen graag met elkaar toen ik de deck of cards api zag wist ik dan ook eindelijk wat mijn concept zou moeten zijn, een potje tjoep natuurlijk! Omdat het tijdens deze moeilijke tijden van corona niet altijd mogelijk is bij elkaar over de vloer te gaan dacht ik dat het leuk en bruikbaar zou zijn om zelf een online toep spel te maken.

![Game](https://user-images.githubusercontent.com/47485018/81941558-44aff900-95f9-11ea-820e-106d353d4a01.png)


## Contents

* ### [Game rules](https://github.com/CountNick/real-time-web-1920#game-rules-1)
* ### [Data lifecycle](https://github.com/CountNick/real-time-web-1920#data-lifecycle-1)
* ### [Data stored](https://github.com/CountNick/real-time-web-1920#data-stored-1)
* ### [Real Time events](https://github.com/CountNick/real-time-web-1920#realtime-events)
    * #### [Client side](https://github.com/CountNick/real-time-web-1920#client-side)
    * #### [Server side](https://github.com/CountNick/real-time-web-1920#server-side)
* ### [API Used](https://github.com/CountNick/real-time-web-1920#api-used-1)
* ### [Features]()
* ### [Installation]()

## Game rules 🎮

Toepen is played with the follwing cards: Ace, King, Queen and Jack and cards 10, 9, 8 and 7. The other cards are removed from the game.

Each player gets 4 cards. One player can play a card on the field. The other players have to match the suit of the first played card. If they don't have a card of that suit they are allowed to play another suit. The highest card of the suit wins the round, and can start the next round. If no one else matches suits with the first played card the first player wins the round.

Whenever you lose you get a point, the player that wins doesn't get points. When you reach 14 points you lose. 

If you decide to toep the other players have to say whether they leave or stay. The players that stay now play for an extra point. Each player can toep once.

If you get 4 cards that aren't numbers you can call 'vuile was'. If no one decides to check if you really don't have any numbered cards, you get to draw 4 new cards and the player that checked you gets a point. If your 'vuile was' was false you get a point and you don't get to draw new cards.



## Data lifecycle :recycle:

![DLS](https://user-images.githubusercontent.com/47485018/81064952-e5583780-8eda-11ea-834e-0229f440116d.png)

## Data stored 🗃

there is an array for each gameroom stored on the server, each game in said array looks like this:

```js
{players: 0 , pid: [0, 0, 0, 0], deck: {}, started: false, turn: 0, currentTurn: 0, playerList: [...]
```

* players: the number of players in the room
* pid: an array which gets filled with the socket id's that have entered the room
* deck: this is an object which will hold the card deck which is fetched from the deck of cards api
* started: a boolean to indicate whether the gameroom already started
* turn and currentTurn: these will hold the turn index of the player who's turn it is
* playerList array: the playerList array holds all player objects. The objects look like this:

```js
    {
      id: '',
      name: '',
      playedCards: [],
      points: 0,
      roundWinner: false,
      multiplier: 0
    }
```

* id: holds the socket id
* name: holds the nickname of the player filled in at the start of the gam
* playedCard: once a card gets played this card will be pushed into this array
* points: holds a number which represents the point a player has
* roundWinner: a boolean which gets set when a player wins a round
* multiplier: if a player joins one or more toeps, these wil get added to the multiplier. At the end of the game these will be multiplied with 1 to get the amount of points


## Realtime events 🎉

### Client side 💻

#### **Emitters**
```js
socket.emit('send-nickname', nickname.value)
//Emits the players chosen nickname to the server
```

```js
socket.emit('room', button.value)
//Emits the players chosen room to the server
```

```js
socket.emit('join toep', currentRoom)
//When a player clicks on the 'ik ga mee' button this event gets emitted to the server
```

```js
socket.emit('fold toep', currentRoom)
//When a player clicks on the 'ik ga niet mee' button this event gets emitted to the server
```

```js
socket.emit('next round', currentRoom)
//When the 'game over' event is triggered this event get emitted to the server, it will reshuffle the deck and emit the deal cards event again
```

```js
socket.emit('clicked card', foundCard, cards, currentRoom)
//When a player clicks on a card he wants to play a function gets fired which find said card and emits it to the server. The card will get pushed into the playedCards array of that player
```

```js
socket.emit('play', currentRoom)
//Once the start game button gets clicked the game will emit the play event to the server, this will start the game
```


```js
socket.emit('toep', 'er word getoept', currentRoom)
//When a player clicks on toep button this event gets emitted to the server, the server will then emit the 'toep popup' event to all sockets except the sender
```


**Listeners**
```js
socket.on('full', (msg) => {})
//When a room is full that a player tries to join, the client will be asked to try and join a different room
```


```js
socket.on('player', (msg, name) => {})
//When a player has joined a room, said player gets all neccessary info on the player event
```


```js
socket.on('your turn', (msg) => {})
//When a player plays a card the turn will be passed to the next player. A function will get executed that adds an eventlistener to each card and removes these eventlisteners when a card is clicked
```


```js
socket.on('toep popup', (msg) => {})
//Shows the toep popup
```

```js
socket.on('deal cards', (cards, turn) => {})
//Appends the players drawn cards to their cards section
```


```js
socket.on('show played card', (card, cards) => {})
//Appends the clicked card to the game field so every player in the room can see the played card
```

```js
socket.on('game over', (msg) => {})
//When a round is over this event will trigger the next round
```


```js
socket.on('points', (number) =>{})
//After a round is finished the point will be send to each socket
```


```js
socket.on('started already', (msg) => {})
//When a room already started playing, and another player wants to join this event gets fired. It will ask the player to join another room
```


### Server side 📟

**Emitters**
```js
socket.to(players[obj.turn]).emit('your turn', `it's your turn ${playerList[obj.turn].name}`)
//Emits the your turn event to the player who's turn it is
```

```js
socket.emit('full', 'This room is full', room)
//Emits a message to the player when the room said player is trying to join is full
```

```js
socket.emit('started already', 'already started playing')
//Emits a message to the payer when a gameroom has started already
```

```js
socket.emit('player', { playerId, players, room}, player.name)
//Emits the neccessary player information to the player
```

```js
socket.broadcast.emit('play', room)
//When there are 2 or more sockets in the room this event gets emitted, and a player can press the start game button which will start the game
```

```js
io.to(playerId).emit("deal cards", transformedCards)
//Will emit the cards to each player
```

```js
socket.to(room).emit('toep popup', `${toeper.name} toept, ga je mee?`)
//This event gets emitted to when a player presses the toep button. He can choose to join or fold
```
```js
io.to(toepFolder.id).emit('points', toepFolder.points)
//When a player folds the points will be emitted to said player
```

```js
io.in(room).emit("game over", `${winner.name}, won this game. Get ready for the next one!`)
//When a round is over this event will be emitted to all clients in the room
```

```js
io.in(room).emit("show played card", playedCard)
//This will emit the played card to the room, which will then get appended in the game section for every player to see
```

```js
io.to(player.id).emit('points', player.points)
//Emits the points to each player at game over
```

**Listeners**
```js
socket.on("send-nickname", (nickname) => {})
//Will listen to the send nickname event, the nickname will get added to the player object
```
```js
socket.on('room', async(room) => {})
//Will emit the chosen room to join to the server. This number will be used as an index to emit to the right gameroom
```
```js
socket.on('play', (room) => {})
//Will deal the cards to each player and start the game
```
```js
socket.on('toep', (msg, room) => {})
//Hanldes the toep event when a socket clicks the toep button, it will emit the toep popup event to each socket except sender
```
```js
socket.on('join toep', (room) => {})
//When a player joins the toep the multiplier value will increase by one for the toeper and the one that joined
```
```js
socket.on('fold toep', (room) => {})
//when a player folds he'll get a point immedeately. When there are just two players this will trigger the next round. If there are more players only the players that joined can play further this round.
```
```js
socket.on("clicked card", async (playedCard, cards, room) => {})
//On this event the gamelogic will check wo played the last card. The clicked card will also be added to the plyedCard array of the player.
```
```js
socket.on("next round", async(room) => {})
//This event will shuffle the deck that belongs to the room, and will deal new cards to all players in the room. the next round is now started
```

## API used 🗂

In order to get a card deck the app makes use of the[Deck of cards api](https://deckofcardsapi.com/). You don't need a API key to use the API, and i don't think theres a request limit. The types of requests that are used:

Endpoint fetches: 

1: Get a new card deck and shuffle the cards, we don't need sixes, fives, fours, threes and two's
```js
async function getNewCardDeck() {
    const getCards = await fetch(
      "https://deckofcardsapi.com/api/deck/new/shuffle/?cards=JS,QS,KS,AS,7S,8S,9S,0S,JD,QD,KD,AD,7D,8D,9D,0D,JC,QC,KC,AC,7C,8C,9C,0C,JH,QH,KH,AH,7H,8H,9H,0H"
    );
  
    const cards = await getCards.json();
  
    return cards;
  }
```
This function gets executed for each item in the games array in a for loop. This is done so each room has it's own deck:

```js
games[i].deck = await Api.getNewCardDeck()
```

the deck object looks like this:

```js
deck: {
    success: true,
    deck_id: '7rvqqcpecrxs',
    remaining: 32,
    shuffled: true
  }
```

2: Draw 4 cards out of the card deck
```js
async function drawCards(id, count) {
    const getCards = await fetch(
      `https://deckofcardsapi.com/api/deck/${id}/draw/?count=${count}`
    );
  
    const cards = await getCards.json();
  
    return cards;
  }
```
This is the data that gets returned: 
```js
{
  success: true,
  deck_id: '0ixa32owkhjo',
  cards: [
    {
      code: '0D',
      image: 'https://deckofcardsapi.com/static/img/0D.png',
      images: [Object],
      value: '10',
      suit: 'DIAMONDS'
    },
    {
      code: '8C',
      image: 'https://deckofcardsapi.com/static/img/8C.png',
      images: [Object],
      value: '8',
      suit: 'CLUBS'
    },
    {
      code: 'QD',
      image: 'https://deckofcardsapi.com/static/img/QD.png',
      images: [Object],
      value: 'QUEEN',
      suit: 'DIAMONDS'
    },
    {
      code: 'AH',
      image: 'https://deckofcardsapi.com/static/img/AH.png',
      images: [Object],
      value: 'ACE',
      suit: 'HEARTS'
    }
  ],
  remaining: 28
}
```
To make my life a little bit easier i pass this array to a transformation function which will give each card with a value of: 'JACK', 'QUEEN', 'KING' or 'ACE' a value of 3, 4, 5 or 6.

the transformation function looks like this:
```js
function transformCardValues(cards){
    
cards.cards.map(card => {
    // console.log('vaaaluee: ', card.value.length)

    if(card.value.length === 1 || card.value === '10') card.value = +card.value

    if(card.value === 'JACK') card.value = 3
    if(card.value === 'QUEEN') card.value = 4
    if(card.value === 'KING') card.value = 5
    if(card.value === 'ACE') card.value = 6
  
  })

  return cards
}
```
And the returned object will then look like this:
```js
{
  success: true,
  deck_id: '0ixa32owkhjo',
  cards: [
    {
      code: '0D',
      image: 'https://deckofcardsapi.com/static/img/0D.png',
      images: [Object],
      value: '10',
      suit: 'DIAMONDS'
    },
    {
      code: '8C',
      image: 'https://deckofcardsapi.com/static/img/8C.png',
      images: [Object],
      value: '8',
      suit: 'CLUBS'
    },
    {
      code: 'QD',
      image: 'https://deckofcardsapi.com/static/img/QD.png',
      images: [Object],
      value: 4,
      suit: 'DIAMONDS'
    },
    {
      code: 'AH',
      image: 'https://deckofcardsapi.com/static/img/AH.png',
      images: [Object],
      value: 6,
      suit: 'HEARTS'
    }
  ],
  remaining: 28
}

```

3: Shuffle the cards when everyone is done with the round
```js
async function shuffleCards(id) {
  const shuffle = await fetch(
    `https://deckofcardsapi.com/api/deck/${id}/shuffle/`
  );

  const shuffledDeck = await shuffle.json()

  return shuffledDeck
}
```

## Installation 📀

```
git clone https://github.com/CountNick/real-time-web-1920.git
```

```
cd real-time-web-1920
```

Start development version: 
```
npm run start:dev
```

Or if you just want to see the app in action on localhost:

```
npm start
```

open up a browser and visit the app at:
```
localhost:4000
```
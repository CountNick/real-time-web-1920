# Tjoep!

![Tjoep](https://user-images.githubusercontent.com/47485018/81940728-2f869a80-95f8-11ea-9786-f4650e0de2c1.png)


## Introduction
Mijn vrienden en ik toepen graag met elkaar toen ik de deck of cards api zag wist ik dan ook eindelijk wat mijn concept zou moeten zijn, een potje tjoep natuurlijk! Omdat het tijdens deze moeilijke tijden van corona niet altijd mogelijk is bij elkaar over de vloer te gaan dacht ik dat het leuk en bruikbaar zou zijn om zelf een online toep spel te maken.

![Game](https://user-images.githubusercontent.com/47485018/81941558-44aff900-95f9-11ea-820e-106d353d4a01.png)


## Contents

* ### [Game rules](https://github.com/CountNick/real-time-web-1920#game-rules-1)
* ### [Data lifecycle](https://github.com/CountNick/real-time-web-1920#data-lifecycle-1)
* ### [Data stored](https://github.com/CountNick/real-time-web-1920#data-stored-1)
* ### [Real Time events](https://github.com/CountNick/real-time-web-1920#realtime-events)
* ### [API Used](https://github.com/CountNick/real-time-web-1920#api-used-1)
* ### [Features]()
* ### [Installation]()

## Game rules

Toepen is played with the follwing cards: Ace, King, Queen and Jack and cards 10, 9, 8 and 7. The other cards are removed from the game.

Each player gets 4 cards. One player can play a card on the field. The other players have to match the suit of the first played card. If they don't have a card of that suit they are allowed to play another suit. The highest card of the suit wins the round, and can start the next round. If no one else matches suits with the first played card the first player wins the round.

Whenever you lose you get a point, the player that wins doesn't get points. When you reach 14 points you lose. 

If you decide to toep the other players have to say whether they leave or stay. The players that stay now play for an extra point. Each player can toep once.

If you get 4 cards that aren't numbers you can call 'vuile was'. If no one decides to check if you really don't have any numbered cards, you get to draw 4 new cards and the player that checked you gets a point. If your 'vuile was' was false you get a point and you don't get to draw new cards.



## Data lifecycle

![DLS](https://user-images.githubusercontent.com/47485018/81064952-e5583780-8eda-11ea-834e-0229f440116d.png)

## Data stored

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


## Realtime events

### Client side

#### **Emitters**
```js
socket.emit('send-nickname', nickname.value)
```
*__Emits the players chosen nickname to the server__*

```js
socket.emit('room', button.value)
```
*__Emits the players chosen room to the server__*

```js
socket.emit('join toep', currentRoom)
```
*__When a player clicks on the 'ik ga mee' button this event gets emitted to the server__*

```js
socket.emit('fold toep', currentRoom)
```
*__When a player clicks on the 'ik ga niet mee' button this event gets emitted to the server__*

```js
socket.emit('next round', currentRoom)
```
*__When the 'game over' event is triggered this event get emitted to the server, it will reshuffle the deck and emit the deal cards event again__*

```js
socket.emit('clicked card', foundCard, cards, currentRoom)
```
*__When a player clicks on a card he wants to play a function gets fired which find said card and emits it to the server. The card will get pushed into the playedCards array of that player__*

```js
socket.emit('play', currentRoom)
```
*__Once the start game button gets clicked the game will emit the play event to the server, this will start the game__*

```js
socket.emit('toep', 'er word getoept', currentRoom)
```
*__When a player clicks on toep button this event gets emitted to the server, the server will then emit the 'toep popup' event to all sockets except the sender__*

**Listeners**
```js
socket.on('full', (msg) => {})
```
*__When a room is full that a player tries to join, the client will be asked to try and join a different room__*

```js
socket.on('player', (msg, name) => {})
```
*__When a player has joined a room, said player gets all neccessary info on the player event__*

```js
socket.on('your turn', (msg) => {})
```
*__When a player plays a card the turn will be passed to the next player. A function will get executed that adds an eventlistener to each card and removes these eventlisteners when a card is clicked__*

```js
socket.on('toep popup', (msg) => {})
```
*__Shows the toep popup__*

```js
socket.on('deal cards', (cards, turn) => {})
```
*__Appends the players drawn cards to their cards section__*

```js
socket.on('show played card', (card, cards) => {})
```
*__Appends the clicked card to the game field so every player in the room can see the played card__*

```js
socket.on('game over', (msg) => {})
```
*__When a round is over this event will trigger the next round__*

```js
socket.on('points', (number) =>{})
```
*__After a round is finished the point will be send to each socket__*

```js
socket.on('started already', (msg) => {})
```
*__When a room already started playing, and another player wants to join this event gets fired. It will ask the player to join another room__*

### Server side

**Emitters**
```js
socket.to(players[obj.turn]).emit('your turn', `it's your turn ${playerList[obj.turn].name}`)
```

```js
socket.emit('full', 'This room is full', room)
```

```js
socket.emit('started already', 'already started playing')
```

```js
socket.emit('player', { playerId, players, room}, player.name)
```

```js
socket.broadcast.emit('play', room)
```

```js
io.to(playerId).emit("deal cards", transformedCards)
```
```js
socket.to(room).emit('toep popup', `${toeper.name} toept, ga je mee?`)
```
```js
io.to(toepFolder.id).emit('points', toepFolder.points)
```

```js
io.in(room).emit("game over", `${winner.name}, won this game. Get ready for the next one!`)
```

```js
io.in(room).emit("show played card", playedCard)
```

```js
io.to(player.id).emit('points', player.points)
```

**Listeners**
```js
socket.on("send-nickname", (nickname) => {})
socket.on('room', async(room) => {})
socket.on('play', (room) => {})
socket.on('toep', (msg, room) => {})
socket.on('join toep', (room) => {})
socket.on('fold toep', (room) => {})
socket.on("clicked card", async (playedCard, cards, room) => {})
socket.on("next round", async(room) => {})
```

### Setup events

#### Send nickname event

This event sends out the nickname a user fills in before starting the game.

```js
socket.emit('send-nickname', nickname.value)
```

#### The room event

Before starting the game players need to choose a room they want to play in

```js
socket.emit('room', button.value)
```

#### Send start signal

Whem theres a minimum of two players in a room, the start signal gets emitted from the server to the clients. 
This makes the start game button clickable for all players in the room.

```js
socket.on('send start signal', (mdg, cards) => {

    startButton.disabled = false

    startButton.addEventListener('click', startGame)
})
```

### Game events

#### Your turn event

Whenever a player has played it's turn a function on the server is fired ot determine who's turn it is next. After determining who's turn it is the your turn event gets emitted to the socket next in line

```js
socket.on('your turn', (msg) => {
    noti = msg

    turn.textContent = noti

    const cardsInHand = document.querySelectorAll('.card')

    const onClick = function() {
        findCard(this, myCards)
        // console.log(this)
        cardsInHand.forEach(card => {
          card.removeEventListener('click', onClick);
        });
      };
      
      cardsInHand.forEach(card => {
        card.addEventListener('click', onClick);
      });

})
```

#### Clicked card event

The clicked card emits to the server which card was clicked, on the server the socket ewho played the card gets added to the played cards object of the rigt players
```js
socket.emit('clicked card', foundCard, cards)
```

#### Toep events

When a player clicks the toepbutton the toep event get send. This event emits a toep popup event to every socket except the sender

```js
toepButton.addEventListener('click', () => socket.emit('toep', 'er word getoept'))
```

Toep popup event
```js
socket.on('toep popup', (msg) => {
    popup.style.display = "block";
    toepMessage.textContent = msg
})
```

#### Deal cards event

The deal cards event appends the cards to the hand of the player

Deal cards event
```js
socket.on('deal cards', (cards, turn) => {

    myCards = cards

    cards.cards.forEach(card => {
        
        appendCard(cardsSection, card.image, 'card')
        
    });
})
```



Show played card event
```js
socket.on('show played card', (card, cards) => {

    appendCard(gameField, card.image, 'playedCard')

})
```

Winner event
```js
socket.on('winner', (winner) => {

    console.log('the winner is: ', winner)

})
```

Round over event
```js
socket.on('round over', (msg) => {
    // gameField.innerHTML = ''

    gameField.innerHTML = ''

    socket.emit('next round')
    
})
```

Round winner event
```js
socket.on('round winner', (msg) => {
    console.log(msg)
})
```


## API used

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
# Features



## Uiteindelijke keuze: Toepen

Mijn vrienden en ik toepen graag met elkaar toen ik de deck of cards api zag wist ik dan ook eindelijk wat mijn concept zou moeten zijn, een potje tjoep natuurlijk!

## Installation


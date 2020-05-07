
const socket = io();

const loginScreen = document.querySelector('.login')
const rooms = document.getElementsByName('room') 
const chatScreen = document.querySelector('.chat')
const loginForm = document.querySelector('.loginForm')
const chatForm = document.querySelector('.chatForm')
const message = document.getElementById('message')
const nickname = document.getElementById('nickname')
const messageList = document.getElementById('messages')
const cardsSection = document.querySelector('.cards')
const gameField = document.querySelector('.gameField')
const turn = document.querySelector('.turn')
const startButton = document.querySelector('.start')

startButton.disabled = true
// const room = 'game'
const leaveButton = document.querySelector('.leave')
let noti;

let myCards;

console.log(rooms)


// appendMessage('You joined')

loginForm.addEventListener('submit', (event) => {
    event.preventDefault()
    
    socket.emit('send-nickname', nickname.value)

    rooms.forEach(button => {
        if(button.checked === true){
            socket.emit('room', button.value)
        }
    
    })

    
    //get the radio button value that is chosen
    
    // socket.emit('room', room.value)
    loginScreen.style.display = 'none'
    gameField.style.display = 'block'
    
})


// chatForm.addEventListener('submit', (event) => {
//     event.preventDefault()

//     if(message.value != ''){
//     appendMessage(`You: ${message.value}`, 'yourMessage')
//     socket.emit('chat message', message.value)
//     message.value = ''
//     }
    
// })


// socket.on('chat message', (msg) => {
//     appendMessage(msg, 'incomingMessage')
// })

// socket.on('user connected', (nickname) => {
//     appendMessage(nickname, 'serverNotification')
// })

// socket.on('server message', (msg) => {
//     appendMessage(msg, 'serverMessage')
// })

// socket.on('challenge', (word) => {
//     console.log(word)
//     appendMessage(word, 'serverMessage')
// })  


socket.on('send start signal', (mdg, cards) => {
    console.log(mdg)

    startButton.disabled = false

    startButton.addEventListener('click', startGame)
    // socket.emit('pass turn')
})

socket.on('your turn', (msg) => {
    console.log('the message: ', msg)
    
    noti = msg

    turn.textContent = noti

    // console.log('kaarta', myCards)

    
    //event listener should be place here

    const cardsInHand = document.querySelectorAll('.card')

    //when card is clicked a broadcast to everyplayer needs to be sent
    // cardsInHand.forEach(card => card.addEventListener("mousedown", _listener, true))

    // cardsInHand.forEach(card => card.removeEventListener("mouseup", _listener, true))

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


socket.on('deal cards', (cards, turn) => {
    // socket.on('pass turn', (player) => console.log('rukkeee:', player))

    
    console.log('caards: ', cards)
    myCards = cards
    
    console.log('my turn: ', turn)
    // console.log('playa: ', playa)

    cards.cards.forEach(card => {
        
        appendCard(cardsSection, card.image, 'card')
        
    });
})

socket.on('show played card', (card, cards) => {
    console.log('clicked card: ', card)
    //Now append the card to the playfield
    

    appendCard(gameField, card.image, 'playedCard')

})



socket.on('winner', (winner) => {

    console.log('the winner is: ', winner)

    // appendMessage(winner, 'winnerMessage')
})

socket.on('round over', (msg) => {
    // gameField.innerHTML = ''

    gameField.innerHTML = ''

    socket.emit('next round')
    
})

socket.on('round winner', (msg) => {
    console.log(msg)
})

function appendMessage(message, classToBeAdded){
    
    let li = document.createElement('li')
    li.className = classToBeAdded
    li.appendChild(document.createTextNode(message))

    messageList.appendChild(li)
}

function appendCard(section, source, classToBeAdded){
    let cardImage = document.createElement('img')

    cardImage.src = source

    cardImage.className = classToBeAdded

    section.appendChild(cardImage)
}

function removeCard(){}

function findCard(ev, cards){
    
    // console.log(ev)
    console.log('cards: ', cards)

    const clickedCard = ev.src

    const foundCard = findCardInArray(cards, clickedCard)

    
    // let findCard = cards.cards.find(card => card.image === clickedCard)
    // console.log('foundCard : ', foundCard)
    socket.emit('pass turn')


    socket.emit('clicked card', foundCard, cards)
  

    ev.remove()

}

function findCardInArray(array, cardToBeFound){
    
    return foundCard = array.cards.find(card => card.image === cardToBeFound)

}

function startGame(){
    socket.emit('start game', 'you can start playing now')
    startButton.removeEventListener('click', startGame);
    startButton.disabled = true
}
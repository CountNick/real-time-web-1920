function findRoundWinner(firstCardValue, findCardFunction, cardsArray, arrNumber, playersArray){          
  
    console.log('oejejjeje', firstCardValue)

    console.log(cardsArray)

    let firstCard = firstCardValue //firstCardValue
    let otherPlayerCards = cardsArray.slice(!0).flat()
    let matchingSuits = otherPlayerCards.filter(card => card.suit === firstCard.suit)
    let winner
    let losers

    if(playersArray.every(player => findCardFunction(player.playedCards.length)) === true && matchingSuits.length === 0){ //findCardFunction
      console.log("::::::::: ROUND FINISHED ::::::::::::::")

        winner = playersArray.find(player => player.playedCards[arrNumber].suit === firstCard.suit)

        console.log(winner)

        winner.roundWinner = true

        losers = playersArray.filter(player => player !== winner)

        console.log('LOSEERS: ', losers)

        losers.map(loser => loser.roundWinner = false)

        
    }
      
    if(playersArray.every(player => findCardFunction(player.playedCards.length)) === true && matchingSuits.length > 0){ //findCardFunction

        matchingSuits.push(firstCard)

        console.log('HEt complete plaatje: ', matchingSuits)

        // find de speler met de hogste kaart nu

        const winningValue = Math.max.apply(Math, matchingSuits.map(card => card.value))

        // now search winning card in matchingSuits

        const winningCard = matchingSuits.find(card => card.value === winningValue)

        console.log('The winningCarrdddd: ', winningCard)
        
        winner = playersArray.find(player => player.playedCards.some(card => card.value === winningCard.value && card.suit === winningCard.suit))

        losers = playersArray.filter(player => player !== winner)

        console.log('LOSEERS: ', losers)

        losers.map(loser => loser.roundWinner = false)

        winner.roundWinner = true

    }
    return winner
  }

  module.exports = {findRoundWinner}
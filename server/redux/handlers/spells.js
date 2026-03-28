const { findPlayerById, checkDeath, isGameOver } = require('../helpers');

function handleLearn(state, action) {
    let newState = Object.assign({}, state);
    for (let c = 0; c < action.draw; c++) {
        let drawnCard = newState.gameboard.spellDeck.topCard();
        if (drawnCard) {
            newState.learnHelper.cardsDrawn.push(drawnCard);
        } else {
            console.log('WARNING: Spell deck empty, could only draw ' + c + ' cards');
            break;
        }
    }
    newState.learnHelper.keep = action.keep;
    newState.history.push(action.message);
    return newState;
}

function handleLearnDiscard(state, action) {
    let newState = Object.assign({}, state);
    let currentPlayer = findPlayerById(newState.players, action.actor.id);
    for (let idx of action.cardIndices) {
        currentPlayer.spells.push(newState.learnHelper.cardsDrawn[idx]);
        newState.learnHelper.cardsDrawn[idx] = null;
    }
    newState.learnHelper.cardsDrawn = newState.learnHelper.cardsDrawn.filter(spell => spell !== null);
    while (newState.learnHelper.cardsDrawn.length > 0) {
        newState.gameboard.spellDeck.discard.push(newState.learnHelper.cardsDrawn.pop());
    }
    newState.learnHelper.keep = null;
    return newState;
}

function handleExhaust(state, action) {
    let newState = Object.assign({}, state);
    let currentPlayer = findPlayerById(newState.players, action.actor.id);
    for (let idx of action.cardIndices) {
        newState.gameboard.spellDeck.discard.push(currentPlayer.spells[idx]);
        currentPlayer.spells[idx] = null;
    }
    currentPlayer.spells = currentPlayer.spells.filter(spell => spell !== null);
    newState.history.push(action.message);
    return newState;
}

function handlePassive(state, action) {
    let newState = Object.assign({}, state);
    let currentPlayer = findPlayerById(newState.players, action.actor.id);
    switch (action.value) {
        case 1: currentPlayer.passives.overdrive = true; break;
        case 2: currentPlayer.passives.hypermetabolism = true; break;
        case 3: currentPlayer.passives.telepathy = true; break;
        case 4: currentPlayer.passives.brilliance = true; break;
    }
    return newState;
}

function handleCastSuccess(state, action) {
    let newState = Object.assign({}, state);
    let currentPlayer = findPlayerById(newState.players, action.actor.id);
    let idx = currentPlayer.spells.findIndex(spell => spell.name == action.spell.name);
    if (idx === -1) return state;
    currentPlayer.spells.splice(idx, 1);
    newState.history.push(action.message);
    return newState;
}

function handleCastFail(state, action) {
    let newState = Object.assign({}, state);
    let currentPlayer = findPlayerById(newState.players, action.actor.id);
    let idx = currentPlayer.spells.findIndex(spell => spell.name == action.spell.name);
    if (idx === -1) return state;
    currentPlayer.spells.splice(idx, 1);
    if (currentPlayer.spells.length > 0) {
        currentPlayer.spells.splice(Math.floor(Math.random() * currentPlayer.spells.length), 1);
    }
    currentPlayer.health--;
    newState.history.push(action.message);
    checkDeath(currentPlayer);
    isGameOver(newState);
    return newState;
}

module.exports = { handleLearn, handleLearnDiscard, handleExhaust, handlePassive, handleCastSuccess, handleCastFail };

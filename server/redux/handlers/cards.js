const { findPlayerById } = require('../helpers');

function handleDivine(state, action) {
    let newState = Object.assign({}, state);
    newState.highlight = action.yx;
    newState.history.push(action.message);
    return newState;
}

function handleUnhighlight(state, action) {
    return Object.assign({}, state, { highlight: [] });
}

function handleWeave(state, action) {
    let newState = Object.assign({}, state);
    newState.highlight = [action.yx1, action.yx2];
    let temp = newState.gameboard.grid[action.yx1[0]][action.yx1[1]];
    newState.gameboard.grid[action.yx1[0]][action.yx1[1]] = newState.gameboard.grid[action.yx2[0]][action.yx2[1]];
    newState.gameboard.grid[action.yx2[0]][action.yx2[1]] = temp;
    newState.history.push(action.message);
    return newState;
}

function handleScry(state, action) {
    let newState = Object.assign({}, state);
    for (let yx of action.yx) {
        newState.gameboard.grid[yx[0]][yx[1]].faceUp = true;
    }
    newState.history.push(action.message);
    return newState;
}

function handleObscure(state, action) {
    let newState = Object.assign({}, state);
    for (let yx of action.yx) {
        newState.gameboard.grid[yx[0]][yx[1]].faceUp = false;
    }
    newState.history.push(action.message);
    return newState;
}

function handleReplaceElements(state, action) {
    let newState = Object.assign({}, state);
    for (let idx of action.yx) {
        newState.gameboard.deck.discard.push(newState.gameboard.grid[idx[0]][idx[1]]);
        let newCard = newState.gameboard.deck.topCard();
        if (!newCard) {
            console.log('WARNING: No card to replace element at ' + idx[0] + ',' + idx[1]);
            continue;
        }
        newState.gameboard.grid[idx[0]][idx[1]] = newCard;
        if ((idx[0] == 1 || idx[0] == 2) && (idx[1] == 1 || idx[1] == 2)) {
            newState.gameboard.grid[idx[0]][idx[1]].faceUp = true;
        }
    }
    return newState;
}

module.exports = { handleDivine, handleUnhighlight, handleWeave, handleScry, handleObscure, handleReplaceElements };

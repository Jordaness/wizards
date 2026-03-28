const { findPlayerById, applyDamage, checkDeath, isGameOver } = require('../helpers');

function handleAttack(state, action) {
    let newState = Object.assign({}, state);
    let target = findPlayerById(newState.players, action.target.id);
    if (target.isGhost) {
        console.log('Target is already dead, skipping ATTACK');
        return state;
    }
    applyDamage(target, action.value);
    newState.history.push(action.message);
    checkDeath(target);
    isGameOver(newState);
    return newState;
}

function handleAttackAll(state, action) {
    let newState = Object.assign({}, state);
    newState.history.push(action.message);
    for (let target of newState.players) {
        if (target.id == action.actor.id || target.isGhost) {
            continue;
        }
        applyDamage(target, action.value);
        checkDeath(target);
        isGameOver(newState);
    }
    return newState;
}

function handleDrain(state, action) {
    let newState = Object.assign({}, state);
    let currentPlayer = findPlayerById(newState.players, action.actor.id);
    let target = findPlayerById(newState.players, action.target.id);
    if (target.isGhost) {
        console.log('Target is already dead, skipping DRAIN');
        return state;
    }
    let damage = action.value;
    while (target.shields > 0 && damage > 0) {
        target.shields--;
        damage--;
    }
    while (damage > 0 && target.health > 0) {
        target.health--;
        damage--;
        if (currentPlayer.health < 5) { currentPlayer.health++; }
    }
    newState.history.push(action.message);
    checkDeath(target);
    isGameOver(newState);
    return newState;
}

function handleCure(state, action) {
    let newState = Object.assign({}, state);
    let currentPlayer = findPlayerById(newState.players, action.actor.id);
    currentPlayer.health += action.value;
    if (currentPlayer.health > 5) { currentPlayer.health = 5; }
    newState.history.push(action.message);
    return newState;
}

function handleShield(state, action) {
    let newState = Object.assign({}, state);
    let currentPlayer = findPlayerById(newState.players, action.actor.id);
    currentPlayer.shields += action.value;
    newState.history.push(action.message);
    return newState;
}

module.exports = { handleAttack, handleAttackAll, handleDrain, handleCure, handleShield };

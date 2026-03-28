const { findPlayerById } = require('../helpers');

/**
 * Shared logic for HP_MINUS and AP_MINUS token effects.
 * tokenKey: 'hptokens' or 'aptokens'
 */
function applyTokenEffect(newState, action, tokenKey) {
    if (action.targetPlayer) {
        let target = findPlayerById(newState.players, action.target.id);
        if (action.limited && target[tokenKey] <= 0) {
            // nothing to strip
        } else if (action.limited && target[tokenKey] > 0) {
            let subtract = action.value;
            let caster = action.magnitize ? findPlayerById(newState.players, action.actor.id) : null;
            while (target[tokenKey] > 0 && subtract > 0) {
                target[tokenKey]--;
                subtract--;
                if (caster) { caster[tokenKey]++; }
            }
        } else {
            target[tokenKey] -= action.value;
        }
    } else {
        for (let target of newState.players) {
            if (target.id == action.actor.id) continue;
            if (action.limited && target[tokenKey] <= 0) continue;
            if (action.limited && target[tokenKey] > 0) {
                let subtract = action.value;
                let caster = action.magnitize ? findPlayerById(newState.players, action.actor.id) : null;
                while (target[tokenKey] > 0 && subtract > 0) {
                    target[tokenKey]--;
                    subtract--;
                    if (caster) { caster[tokenKey]++; }
                }
            } else {
                target[tokenKey] -= action.value;
            }
        }
    }
}

function handleHpPlus(state, action) {
    let newState = Object.assign({}, state);
    let currentPlayer = findPlayerById(newState.players, action.actor.id);
    currentPlayer.hptokens += action.value;
    newState.history.push(action.message);
    return newState;
}

function handleHpMinus(state, action) {
    let newState = Object.assign({}, state);
    applyTokenEffect(newState, action, 'hptokens');
    newState.history.push(action.message);
    return newState;
}

function handleApPlus(state, action) {
    let newState = Object.assign({}, state);
    let currentPlayer = findPlayerById(newState.players, action.actor.id);
    currentPlayer.aptokens += action.value;
    newState.history.push(action.message);
    return newState;
}

function handleApMinus(state, action) {
    let newState = Object.assign({}, state);
    applyTokenEffect(newState, action, 'aptokens');
    newState.history.push(action.message);
    return newState;
}

module.exports = { handleHpPlus, handleHpMinus, handleApPlus, handleApMinus, applyTokenEffect };

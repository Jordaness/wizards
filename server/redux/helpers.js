function findPlayerById(players, id) {
    return players.find(p => p.id == id);
}

function applyDamage(target, damage) {
    while (target.shields > 0 && damage > 0) {
        target.shields--;
        damage--;
    }
    target.health -= damage;
    return damage;
}

function checkDeath(player) {
    if (player.health <= 0) {
        player.isGhost = true;
        player.shields = 0;
        player.passives.brilliance = false;
        player.passives.overdrive = false;
        player.passives.telepathy = false;
        player.passives.hypermetabolism = false;
        player.aptokens = 0;
        player.hptokens = 0;
        console.log('HE DED');
        return true;
    }
    return false;
}

function isGameOver(state) {
    let playersAlive = state.players.reduce((alive, player) => {
        return player.isGhost ? alive : alive + 1;
    }, 0);
    console.log(playersAlive + ' players still alive');
    if (playersAlive == 1) {
        state.gameOn = false;
        state.gameOver = true;
        state.winner = state.players.find(player => !player.isGhost);
        state.history.push(state.winner.name + ' won the game, and is now the Archchancellor!');
    }
    return state;
}

function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

/**
 * Strip sensitive data (deck internals) before sending state to clients.
 */
function sanitizeState(state) {
    if (!state || !state.gameboard) return state;
    let clean = Object.assign({}, state);
    clean.gameboard = Object.assign({}, state.gameboard);
    clean.gameboard.deck = {
        remaining: state.gameboard.deck ? state.gameboard.deck.cards.length : 0
    };
    clean.gameboard.spellDeck = {
        remaining: state.gameboard.spellDeck ? state.gameboard.spellDeck.cards.length : 0
    };
    return clean;
}

module.exports = { findPlayerById, applyDamage, checkDeath, isGameOver, shuffle, sanitizeState };

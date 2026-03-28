const { findPlayerById, applyDamage, checkDeath, isGameOver, shuffle, sanitizeState } = require('./helpers');

function makePlayer(overrides = {}) {
    return Object.assign({
        id: 1, name: 'TestWizard', health: 5, shields: 0,
        aptokens: 0, hptokens: 0, isGhost: false,
        passives: { overdrive: false, hypermetabolism: false, telepathy: false, brilliance: false }
    }, overrides);
}

// findPlayerById
console.log('--- findPlayerById ---');
let players = [makePlayer({ id: 1 }), makePlayer({ id: 2, name: 'Wizard2' })];
let found = findPlayerById(players, 2);
console.assert(found.name === 'Wizard2', 'should find player by id');
let notFound = findPlayerById(players, 99);
console.assert(notFound === undefined, 'should return undefined for missing id');

// applyDamage — no shields
console.log('--- applyDamage ---');
let p1 = makePlayer({ health: 5, shields: 0 });
applyDamage(p1, 3);
console.assert(p1.health === 2, 'should deal 3 damage, health=2, got ' + p1.health);
console.assert(p1.shields === 0, 'shields should stay 0');

// applyDamage — with shields
let p2 = makePlayer({ health: 5, shields: 2 });
applyDamage(p2, 3);
console.assert(p2.shields === 0, 'shields should be 0 after absorbing, got ' + p2.shields);
console.assert(p2.health === 4, 'should deal 1 damage after shields, health=4, got ' + p2.health);

// applyDamage — shields absorb all
let p3 = makePlayer({ health: 5, shields: 5 });
applyDamage(p3, 3);
console.assert(p3.shields === 2, 'shields should be 2, got ' + p3.shields);
console.assert(p3.health === 5, 'health should be 5, got ' + p3.health);

// checkDeath — alive
console.log('--- checkDeath ---');
let alive = makePlayer({ health: 1 });
let died = checkDeath(alive);
console.assert(died === false, 'should not be dead');
console.assert(alive.isGhost === false, 'should not be ghost');

// checkDeath — dead
let dead = makePlayer({ health: 0, shields: 3, aptokens: 2, hptokens: 2 });
dead.passives.brilliance = true;
died = checkDeath(dead);
console.assert(died === true, 'should be dead');
console.assert(dead.isGhost === true, 'should be ghost');
console.assert(dead.shields === 0, 'shields should be cleared');
console.assert(dead.aptokens === 0, 'aptokens should be cleared');
console.assert(dead.hptokens === 0, 'hptokens should be cleared');
console.assert(dead.passives.brilliance === false, 'passives should be cleared');

// isGameOver — not over
console.log('--- isGameOver ---');
let state1 = { players: [makePlayer(), makePlayer({ id: 2 })], history: [] };
isGameOver(state1);
console.assert(state1.gameOver !== true, 'game should not be over with 2 alive');

// isGameOver — over
let state2 = {
    players: [makePlayer(), makePlayer({ id: 2, health: 0, isGhost: true })],
    gameOn: true, gameOver: false, winner: null, history: []
};
isGameOver(state2);
console.assert(state2.gameOver === true, 'game should be over');
console.assert(state2.winner.id === 1, 'winner should be player 1');

// shuffle — same length
console.log('--- shuffle ---');
let arr = [1, 2, 3, 4, 5];
shuffle(arr);
console.assert(arr.length === 5, 'shuffle should preserve length');

// sanitizeState — strips deck internals
console.log('--- sanitizeState ---');
let fakeState = {
    gameboard: {
        grid: [[{elem: 'fire', faceUp: true}]],
        deck: { cards: [1, 2, 3], discard: [] },
        spellDeck: { cards: [1, 2], discard: [] }
    },
    players: [], history: []
};
let clean = sanitizeState(fakeState);
console.assert(clean.gameboard.deck.remaining === 3, 'deck remaining should be 3, got ' + clean.gameboard.deck.remaining);
console.assert(clean.gameboard.spellDeck.remaining === 2, 'spellDeck remaining should be 2');
console.assert(clean.gameboard.deck.cards === undefined, 'deck cards should be stripped');
console.assert(clean.gameboard.grid === fakeState.gameboard.grid, 'grid should be preserved');

// sanitizeState — null gameboard
let cleanNull = sanitizeState({ players: [], history: [] });
console.assert(cleanNull.gameboard === undefined, 'should handle null gameboard');

console.log('--- helpers tests complete ---');

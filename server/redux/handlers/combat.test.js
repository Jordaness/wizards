const { handleAttack, handleAttackAll, handleDrain, handleCure, handleShield } = require('./combat');

function makePlayer(overrides = {}) {
    return Object.assign({
        id: 1, name: 'Wizard1', health: 5, shields: 0,
        aptokens: 0, hptokens: 0, isGhost: false,
        passives: { overdrive: false, hypermetabolism: false, telepathy: false, brilliance: false }
    }, overrides);
}

function makeState(players) {
    return { players, history: [], gameOn: true, gameOver: false, winner: null };
}

// ATTACK
console.log('--- handleAttack ---');
let s = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, name: 'Wizard2' })]);
let result = handleAttack(s, { target: { id: 2 }, value: 2, message: 'attack msg' });
console.assert(result.players[1].health === 3, 'target should have 3 health, got ' + result.players[1].health);
console.assert(result.history.includes('attack msg'), 'history should include message');

// ATTACK ghost — should return original state
let s2 = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, isGhost: true })]);
let result2 = handleAttack(s2, { target: { id: 2 }, value: 2, message: 'attack msg' });
console.assert(result2 === s2, 'should return original state when targeting ghost');

// ATTACK with shields
let s3 = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, name: 'Wizard2', shields: 2 })]);
let result3 = handleAttack(s3, { target: { id: 2 }, value: 3, message: 'attack msg' });
console.assert(result3.players[1].shields === 0, 'shields should be 0, got ' + result3.players[1].shields);
console.assert(result3.players[1].health === 4, 'health should be 4, got ' + result3.players[1].health);

// ATTACK_ALL
console.log('--- handleAttackAll ---');
let s4 = makeState([
    makePlayer({ id: 1, name: 'Attacker' }),
    makePlayer({ id: 2, name: 'Target1' }),
    makePlayer({ id: 3, name: 'Target2' })
]);
let result4 = handleAttackAll(s4, { actor: { id: 1 }, value: 1, message: 'aoe msg' });
console.assert(result4.players[0].health === 5, 'attacker should be unharmed');
console.assert(result4.players[1].health === 4, 'target1 should have 4 health, got ' + result4.players[1].health);
console.assert(result4.players[2].health === 4, 'target2 should have 4 health, got ' + result4.players[2].health);

// ATTACK_ALL skips ghosts
let s5 = makeState([
    makePlayer({ id: 1, name: 'Attacker' }),
    makePlayer({ id: 2, name: 'Ghost', isGhost: true }),
    makePlayer({ id: 3, name: 'Alive' })
]);
let result5 = handleAttackAll(s5, { actor: { id: 1 }, value: 2, message: 'aoe msg' });
console.assert(result5.players[1].health === 5, 'ghost health should be unchanged');
console.assert(result5.players[2].health === 3, 'alive target should have 3 health, got ' + result5.players[2].health);

// DRAIN
console.log('--- handleDrain ---');
let s6 = makeState([makePlayer({ id: 1, name: 'Drainer', health: 3 }), makePlayer({ id: 2, name: 'Victim' })]);
let result6 = handleDrain(s6, { actor: { id: 1 }, target: { id: 2 }, value: 2, message: 'drain msg' });
console.assert(result6.players[1].health === 3, 'victim should have 3 health, got ' + result6.players[1].health);
console.assert(result6.players[0].health === 5, 'drainer should have 5 health, got ' + result6.players[0].health);

// DRAIN ghost
let s7 = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, isGhost: true })]);
let result7 = handleDrain(s7, { actor: { id: 1 }, target: { id: 2 }, value: 2, message: 'drain msg' });
console.assert(result7 === s7, 'should return original state when draining ghost');

// CURE
console.log('--- handleCure ---');
let s8 = makeState([makePlayer({ id: 1, health: 2 })]);
let result8 = handleCure(s8, { actor: { id: 1 }, value: 2, message: 'cure msg' });
console.assert(result8.players[0].health === 4, 'should heal to 4, got ' + result8.players[0].health);

// CURE cap at 5
let s9 = makeState([makePlayer({ id: 1, health: 4 })]);
let result9 = handleCure(s9, { actor: { id: 1 }, value: 3, message: 'cure msg' });
console.assert(result9.players[0].health === 5, 'should cap at 5, got ' + result9.players[0].health);

// SHIELD
console.log('--- handleShield ---');
let s10 = makeState([makePlayer({ id: 1, shields: 1 })]);
let result10 = handleShield(s10, { actor: { id: 1 }, value: 2, message: 'shield msg' });
console.assert(result10.players[0].shields === 3, 'should have 3 shields, got ' + result10.players[0].shields);

// ATTACK that kills
console.log('--- handleAttack kill ---');
let s11 = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, name: 'Victim', health: 1 })]);
let result11 = handleAttack(s11, { target: { id: 2 }, value: 2, message: 'kill msg' });
console.assert(result11.players[1].isGhost === true, 'victim should be ghost');
console.assert(result11.gameOver === true, 'game should be over');
console.assert(result11.winner.id === 1, 'winner should be player 1');

console.log('--- combat tests complete ---');

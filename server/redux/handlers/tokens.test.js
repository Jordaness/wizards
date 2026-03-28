const { handleHpPlus, handleHpMinus, handleApPlus, handleApMinus } = require('./tokens');

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

// HP_PLUS
console.log('--- handleHpPlus ---');
let s1 = makeState([makePlayer({ id: 1, hptokens: 0 })]);
let r1 = handleHpPlus(s1, { actor: { id: 1 }, value: 3, message: 'hp+ msg' });
console.assert(r1.players[0].hptokens === 3, 'should have 3 hptokens, got ' + r1.players[0].hptokens);

// HP_MINUS single target
console.log('--- handleHpMinus ---');
let s2 = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, hptokens: 0 })]);
let r2 = handleHpMinus(s2, { actor: { id: 1 }, target: { id: 2 }, value: 2, targetPlayer: true, message: 'hp- msg' });
console.assert(r2.players[1].hptokens === -2, 'should have -2 hptokens, got ' + r2.players[1].hptokens);

// HP_MINUS limited strip
let s3 = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, hptokens: 3 })]);
let r3 = handleHpMinus(s3, { actor: { id: 1 }, target: { id: 2 }, value: 2, targetPlayer: true, limited: true, message: 'strip msg' });
console.assert(r3.players[1].hptokens === 1, 'should have 1 hptoken after stripping 2, got ' + r3.players[1].hptokens);

// HP_MINUS limited skip when already negative
let s4 = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, hptokens: -1 })]);
let r4 = handleHpMinus(s4, { actor: { id: 1 }, target: { id: 2 }, value: 2, targetPlayer: true, limited: true, message: 'skip msg' });
console.assert(r4.players[1].hptokens === -1, 'should still be -1, got ' + r4.players[1].hptokens);

// HP_MINUS AOE
let s5 = makeState([
    makePlayer({ id: 1, name: 'Caster' }),
    makePlayer({ id: 2, name: 'T1', hptokens: 0 }),
    makePlayer({ id: 3, name: 'T2', hptokens: 0 })
]);
let r5 = handleHpMinus(s5, { actor: { id: 1 }, value: 1, targetPlayer: false, message: 'aoe hp- msg' });
console.assert(r5.players[0].hptokens === 0, 'caster should be unaffected');
console.assert(r5.players[1].hptokens === -1, 'T1 should have -1, got ' + r5.players[1].hptokens);
console.assert(r5.players[2].hptokens === -1, 'T2 should have -1, got ' + r5.players[2].hptokens);

// HP_MINUS magnetize
let s6 = makeState([makePlayer({ id: 1, hptokens: 0 }), makePlayer({ id: 2, hptokens: 3 })]);
let r6 = handleHpMinus(s6, { actor: { id: 1 }, target: { id: 2 }, value: 2, targetPlayer: false, limited: true, magnitize: true, message: 'mag msg' });
console.assert(r6.players[1].hptokens === 1, 'target should have 1, got ' + r6.players[1].hptokens);
console.assert(r6.players[0].hptokens === 2, 'caster should have 2 from magnetize, got ' + r6.players[0].hptokens);

// AP_PLUS
console.log('--- handleApPlus ---');
let s7 = makeState([makePlayer({ id: 1, aptokens: 0 })]);
let r7 = handleApPlus(s7, { actor: { id: 1 }, value: 2, message: 'ap+ msg' });
console.assert(r7.players[0].aptokens === 2, 'should have 2 aptokens, got ' + r7.players[0].aptokens);

// AP_MINUS single target
console.log('--- handleApMinus ---');
let s8 = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, aptokens: 0 })]);
let r8 = handleApMinus(s8, { actor: { id: 1 }, target: { id: 2 }, value: 1, targetPlayer: true, message: 'ap- msg' });
console.assert(r8.players[1].aptokens === -1, 'should have -1 aptokens, got ' + r8.players[1].aptokens);

console.log('--- tokens tests complete ---');

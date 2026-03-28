const { handleLearn, handleLearnDiscard, handleExhaust, handlePassive, handleCastSuccess, handleCastFail } = require('./spells');

function makePlayer(overrides = {}) {
    return Object.assign({
        id: 1, name: 'Wizard1', health: 5, shields: 0,
        aptokens: 0, hptokens: 0, isGhost: false,
        spells: [],
        passives: { overdrive: false, hypermetabolism: false, telepathy: false, brilliance: false }
    }, overrides);
}

function makeDeck(cards) {
    return {
        cards: cards || [],
        discard: [],
        topCard() {
            if (this.cards.length === 0) return null;
            return this.cards.pop();
        }
    };
}

function makeState(players, spellDeckCards) {
    return {
        players,
        gameboard: { spellDeck: makeDeck(spellDeckCards || []) },
        history: [],
        learnHelper: { keep: null, cardsDrawn: [] },
        gameOn: true, gameOver: false, winner: null
    };
}

// LEARN
console.log('--- handleLearn ---');
let s1 = makeState([makePlayer()], [{ name: 'S1' }, { name: 'S2' }, { name: 'S3' }, { name: 'S4' }]);
let r1 = handleLearn(s1, { draw: 3, keep: 1, message: 'learn msg' });
console.assert(r1.learnHelper.cardsDrawn.length === 3, 'should draw 3, got ' + r1.learnHelper.cardsDrawn.length);
console.assert(r1.learnHelper.keep === 1, 'keep should be 1');

// LEARN — empty deck
let s2 = makeState([makePlayer()], []);
let r2 = handleLearn(s2, { draw: 3, keep: 1, message: 'learn msg' });
console.assert(r2.learnHelper.cardsDrawn.length === 0, 'should draw 0 from empty deck');

// LEARN_DISCARD
console.log('--- handleLearnDiscard ---');
let s3 = makeState([makePlayer({ id: 1 })], []);
s3.learnHelper.cardsDrawn = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
s3.learnHelper.keep = 1;
let r3 = handleLearnDiscard(s3, { actor: { id: 1 }, cardIndices: [1] });
console.assert(r3.players[0].spells.length === 1, 'should have 1 spell, got ' + r3.players[0].spells.length);
console.assert(r3.players[0].spells[0].name === 'B', 'should keep spell B');
console.assert(r3.learnHelper.keep === null, 'keep should be null');
console.assert(r3.gameboard.spellDeck.discard.length === 2, 'should discard 2, got ' + r3.gameboard.spellDeck.discard.length);

// EXHAUST
console.log('--- handleExhaust ---');
let s4 = makeState([makePlayer({ id: 1, spells: [{ name: 'X' }, { name: 'Y' }, { name: 'Z' }] })], []);
let r4 = handleExhaust(s4, { actor: { id: 1 }, cardIndices: [0, 2], message: 'exhaust msg' });
console.assert(r4.players[0].spells.length === 1, 'should have 1 spell left, got ' + r4.players[0].spells.length);
console.assert(r4.players[0].spells[0].name === 'Y', 'should keep Y');
console.assert(r4.gameboard.spellDeck.discard.length === 2, 'should discard 2');

// PASSIVE
console.log('--- handlePassive ---');
let s5 = makeState([makePlayer({ id: 1 })]);
let r5 = handlePassive(s5, { actor: { id: 1 }, value: 1 });
console.assert(r5.players[0].passives.overdrive === true, 'overdrive should be true');
let r5b = handlePassive(s5, { actor: { id: 1 }, value: 3 });
console.assert(r5b.players[0].passives.telepathy === true, 'telepathy should be true');

// CAST_SUCCESS
console.log('--- handleCastSuccess ---');
let s6 = makeState([makePlayer({ id: 1, spells: [{ name: 'Fireball' }, { name: 'Heal' }] })]);
let r6 = handleCastSuccess(s6, { actor: { id: 1 }, spell: { name: 'Fireball' }, message: 'cast msg' });
console.assert(r6.players[0].spells.length === 1, 'should have 1 spell, got ' + r6.players[0].spells.length);
console.assert(r6.players[0].spells[0].name === 'Heal', 'should keep Heal');

// CAST_SUCCESS — spell not found
let s7 = makeState([makePlayer({ id: 1, spells: [{ name: 'Heal' }] })]);
let r7 = handleCastSuccess(s7, { actor: { id: 1 }, spell: { name: 'Missing' }, message: 'cast msg' });
console.assert(r7 === s7, 'should return original state if spell not found');

// CAST_FAIL
console.log('--- handleCastFail ---');
let s8 = makeState([
    makePlayer({ id: 1, spells: [{ name: 'Fireball' }, { name: 'Heal' }, { name: 'Shield' }] }),
    makePlayer({ id: 2 })
]);
let r8 = handleCastFail(s8, { actor: { id: 1 }, spell: { name: 'Fireball' }, message: 'fail msg' });
console.assert(r8.players[0].health === 4, 'should take 1 damage, got ' + r8.players[0].health);
// Cast fail removes the spell + 1 random additional spell
console.assert(r8.players[0].spells.length === 1, 'should have 1 spell left, got ' + r8.players[0].spells.length);

console.log('--- spells tests complete ---');

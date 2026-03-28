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

describe('handleLearn', () => {
    test('should draw cards from spell deck', () => {
        const s = makeState([makePlayer()], [{ name: 'S1' }, { name: 'S2' }, { name: 'S3' }, { name: 'S4' }]);
        const r = handleLearn(s, { draw: 3, keep: 1, message: 'learn msg' });
        expect(r.learnHelper.cardsDrawn).toHaveLength(3);
        expect(r.learnHelper.keep).toBe(1);
    });

    test('should handle empty deck gracefully', () => {
        const s = makeState([makePlayer()], []);
        const r = handleLearn(s, { draw: 3, keep: 1, message: 'learn msg' });
        expect(r.learnHelper.cardsDrawn).toHaveLength(0);
    });
});

describe('handleLearnDiscard', () => {
    test('should keep selected cards and discard the rest', () => {
        const s = makeState([makePlayer({ id: 1 })], []);
        s.learnHelper.cardsDrawn = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
        s.learnHelper.keep = 1;
        const r = handleLearnDiscard(s, { actor: { id: 1 }, cardIndices: [1] });
        expect(r.players[0].spells).toHaveLength(1);
        expect(r.players[0].spells[0].name).toBe('B');
        expect(r.learnHelper.keep).toBeNull();
        expect(r.gameboard.spellDeck.discard).toHaveLength(2);
    });
});

describe('handleExhaust', () => {
    test('should remove selected spells and discard them', () => {
        const s = makeState([makePlayer({ id: 1, spells: [{ name: 'X' }, { name: 'Y' }, { name: 'Z' }] })], []);
        const r = handleExhaust(s, { actor: { id: 1 }, cardIndices: [0, 2], message: 'exhaust msg' });
        expect(r.players[0].spells).toHaveLength(1);
        expect(r.players[0].spells[0].name).toBe('Y');
        expect(r.gameboard.spellDeck.discard).toHaveLength(2);
    });
});

describe('handlePassive', () => {
    test('should enable overdrive', () => {
        const s = makeState([makePlayer({ id: 1 })]);
        const r = handlePassive(s, { actor: { id: 1 }, value: 1 });
        expect(r.players[0].passives.overdrive).toBe(true);
    });

    test('should enable telepathy', () => {
        const s = makeState([makePlayer({ id: 1 })]);
        const r = handlePassive(s, { actor: { id: 1 }, value: 3 });
        expect(r.players[0].passives.telepathy).toBe(true);
    });

    test('should enable hypermetabolism', () => {
        const s = makeState([makePlayer({ id: 1 })]);
        const r = handlePassive(s, { actor: { id: 1 }, value: 2 });
        expect(r.players[0].passives.hypermetabolism).toBe(true);
    });

    test('should enable brilliance', () => {
        const s = makeState([makePlayer({ id: 1 })]);
        const r = handlePassive(s, { actor: { id: 1 }, value: 4 });
        expect(r.players[0].passives.brilliance).toBe(true);
    });
});

describe('handleCastSuccess', () => {
    test('should remove cast spell from hand', () => {
        const s = makeState([makePlayer({ id: 1, spells: [{ name: 'Fireball' }, { name: 'Heal' }] })]);
        const r = handleCastSuccess(s, { actor: { id: 1 }, spell: { name: 'Fireball' }, message: 'cast msg' });
        expect(r.players[0].spells).toHaveLength(1);
        expect(r.players[0].spells[0].name).toBe('Heal');
    });

    test('should return original state if spell not found', () => {
        const s = makeState([makePlayer({ id: 1, spells: [{ name: 'Heal' }] })]);
        const r = handleCastSuccess(s, { actor: { id: 1 }, spell: { name: 'Missing' }, message: 'cast msg' });
        expect(r).toBe(s);
    });
});

describe('handleCastFail', () => {
    test('should remove spell, destroy another, and deal 1 damage', () => {
        const s = makeState([
            makePlayer({ id: 1, spells: [{ name: 'Fireball' }, { name: 'Heal' }, { name: 'Shield' }] }),
            makePlayer({ id: 2 })
        ]);
        const r = handleCastFail(s, { actor: { id: 1 }, spell: { name: 'Fireball' }, message: 'fail msg' });
        expect(r.players[0].health).toBe(4);
        expect(r.players[0].spells).toHaveLength(1);
    });

    test('should return original state if spell not found', () => {
        const s = makeState([makePlayer({ id: 1, spells: [{ name: 'Heal' }] }), makePlayer({ id: 2 })]);
        const r = handleCastFail(s, { actor: { id: 1 }, spell: { name: 'Missing' }, message: 'fail msg' });
        expect(r).toBe(s);
    });
});

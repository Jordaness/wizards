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

describe('handleHpPlus', () => {
    test('should add hptokens to actor', () => {
        const s = makeState([makePlayer({ id: 1, hptokens: 0 })]);
        const r = handleHpPlus(s, { actor: { id: 1 }, value: 3, message: 'hp+ msg' });
        expect(r.players[0].hptokens).toBe(3);
    });
});

describe('handleHpMinus', () => {
    test('should subtract hptokens from single target', () => {
        const s = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, hptokens: 0 })]);
        const r = handleHpMinus(s, { actor: { id: 1 }, target: { id: 2 }, value: 2, targetPlayer: true, message: 'hp- msg' });
        expect(r.players[1].hptokens).toBe(-2);
    });

    test('should strip limited tokens from target', () => {
        const s = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, hptokens: 3 })]);
        const r = handleHpMinus(s, { actor: { id: 1 }, target: { id: 2 }, value: 2, targetPlayer: true, limited: true, message: 'strip msg' });
        expect(r.players[1].hptokens).toBe(1);
    });

    test('should skip limited strip when target already negative', () => {
        const s = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, hptokens: -1 })]);
        const r = handleHpMinus(s, { actor: { id: 1 }, target: { id: 2 }, value: 2, targetPlayer: true, limited: true, message: 'skip msg' });
        expect(r.players[1].hptokens).toBe(-1);
    });

    test('should apply AOE to all non-actor players', () => {
        const s = makeState([
            makePlayer({ id: 1, name: 'Caster' }),
            makePlayer({ id: 2, name: 'T1', hptokens: 0 }),
            makePlayer({ id: 3, name: 'T2', hptokens: 0 })
        ]);
        const r = handleHpMinus(s, { actor: { id: 1 }, value: 1, targetPlayer: false, message: 'aoe hp- msg' });
        expect(r.players[0].hptokens).toBe(0);
        expect(r.players[1].hptokens).toBe(-1);
        expect(r.players[2].hptokens).toBe(-1);
    });

    test('should magnetize stripped tokens to caster', () => {
        const s = makeState([makePlayer({ id: 1, hptokens: 0 }), makePlayer({ id: 2, hptokens: 3 })]);
        const r = handleHpMinus(s, { actor: { id: 1 }, target: { id: 2 }, value: 2, targetPlayer: false, limited: true, magnitize: true, message: 'mag msg' });
        expect(r.players[1].hptokens).toBe(1);
        expect(r.players[0].hptokens).toBe(2);
    });
});

describe('handleApPlus', () => {
    test('should add aptokens to actor', () => {
        const s = makeState([makePlayer({ id: 1, aptokens: 0 })]);
        const r = handleApPlus(s, { actor: { id: 1 }, value: 2, message: 'ap+ msg' });
        expect(r.players[0].aptokens).toBe(2);
    });
});

describe('handleApMinus', () => {
    test('should subtract aptokens from single target', () => {
        const s = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, aptokens: 0 })]);
        const r = handleApMinus(s, { actor: { id: 1 }, target: { id: 2 }, value: 1, targetPlayer: true, message: 'ap- msg' });
        expect(r.players[1].aptokens).toBe(-1);
    });
});

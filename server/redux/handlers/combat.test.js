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

describe('handleAttack', () => {
    test('should deal damage to target', () => {
        const s = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, name: 'Wizard2' })]);
        const result = handleAttack(s, { target: { id: 2 }, value: 2, message: 'attack msg' });
        expect(result.players[1].health).toBe(3);
        expect(result.history).toContain('attack msg');
    });

    test('should return original state when targeting ghost', () => {
        const s = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, isGhost: true })]);
        const result = handleAttack(s, { target: { id: 2 }, value: 2, message: 'attack msg' });
        expect(result).toBe(s);
    });

    test('should absorb damage with shields first', () => {
        const s = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, shields: 2 })]);
        const result = handleAttack(s, { target: { id: 2 }, value: 3, message: 'attack msg' });
        expect(result.players[1].shields).toBe(0);
        expect(result.players[1].health).toBe(4);
    });

    test('should kill target and trigger game over', () => {
        const s = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, name: 'Victim', health: 1 })]);
        const result = handleAttack(s, { target: { id: 2 }, value: 2, message: 'kill msg' });
        expect(result.players[1].isGhost).toBe(true);
        expect(result.gameOver).toBe(true);
        expect(result.winner.id).toBe(1);
    });
});

describe('handleAttackAll', () => {
    test('should damage all non-actor players', () => {
        const s = makeState([
            makePlayer({ id: 1, name: 'Attacker' }),
            makePlayer({ id: 2, name: 'Target1' }),
            makePlayer({ id: 3, name: 'Target2' })
        ]);
        const result = handleAttackAll(s, { actor: { id: 1 }, value: 1, message: 'aoe msg' });
        expect(result.players[0].health).toBe(5);
        expect(result.players[1].health).toBe(4);
        expect(result.players[2].health).toBe(4);
    });

    test('should skip ghost players', () => {
        const s = makeState([
            makePlayer({ id: 1, name: 'Attacker' }),
            makePlayer({ id: 2, name: 'Ghost', isGhost: true }),
            makePlayer({ id: 3, name: 'Alive' })
        ]);
        const result = handleAttackAll(s, { actor: { id: 1 }, value: 2, message: 'aoe msg' });
        expect(result.players[1].health).toBe(5);
        expect(result.players[2].health).toBe(3);
    });
});

describe('handleDrain', () => {
    test('should drain health from target to actor', () => {
        const s = makeState([makePlayer({ id: 1, name: 'Drainer', health: 3 }), makePlayer({ id: 2, name: 'Victim' })]);
        const result = handleDrain(s, { actor: { id: 1 }, target: { id: 2 }, value: 2, message: 'drain msg' });
        expect(result.players[1].health).toBe(3);
        expect(result.players[0].health).toBe(5);
    });

    test('should return original state when draining ghost', () => {
        const s = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2, isGhost: true })]);
        const result = handleDrain(s, { actor: { id: 1 }, target: { id: 2 }, value: 2, message: 'drain msg' });
        expect(result).toBe(s);
    });
});

describe('handleCure', () => {
    test('should heal actor', () => {
        const s = makeState([makePlayer({ id: 1, health: 2 })]);
        const result = handleCure(s, { actor: { id: 1 }, value: 2, message: 'cure msg' });
        expect(result.players[0].health).toBe(4);
    });

    test('should cap health at 5', () => {
        const s = makeState([makePlayer({ id: 1, health: 4 })]);
        const result = handleCure(s, { actor: { id: 1 }, value: 3, message: 'cure msg' });
        expect(result.players[0].health).toBe(5);
    });
});

describe('handleShield', () => {
    test('should add shields to actor', () => {
        const s = makeState([makePlayer({ id: 1, shields: 1 })]);
        const result = handleShield(s, { actor: { id: 1 }, value: 2, message: 'shield msg' });
        expect(result.players[0].shields).toBe(3);
    });
});

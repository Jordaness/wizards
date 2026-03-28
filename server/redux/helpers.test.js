const { findPlayerById, applyDamage, checkDeath, isGameOver, shuffle, sanitizeState } = require('./helpers');

function makePlayer(overrides = {}) {
    return Object.assign({
        id: 1, name: 'TestWizard', health: 5, shields: 0,
        aptokens: 0, hptokens: 0, isGhost: false,
        passives: { overdrive: false, hypermetabolism: false, telepathy: false, brilliance: false }
    }, overrides);
}

describe('findPlayerById', () => {
    test('should find player by id', () => {
        const players = [makePlayer({ id: 1 }), makePlayer({ id: 2, name: 'Wizard2' })];
        expect(findPlayerById(players, 2).name).toBe('Wizard2');
    });

    test('should return undefined for missing id', () => {
        const players = [makePlayer({ id: 1 })];
        expect(findPlayerById(players, 99)).toBeUndefined();
    });
});

describe('applyDamage', () => {
    test('should deal full damage with no shields', () => {
        const p = makePlayer({ health: 5, shields: 0 });
        applyDamage(p, 3);
        expect(p.health).toBe(2);
        expect(p.shields).toBe(0);
    });

    test('should absorb partial damage with shields', () => {
        const p = makePlayer({ health: 5, shields: 2 });
        applyDamage(p, 3);
        expect(p.shields).toBe(0);
        expect(p.health).toBe(4);
    });

    test('should absorb all damage when shields exceed damage', () => {
        const p = makePlayer({ health: 5, shields: 5 });
        applyDamage(p, 3);
        expect(p.shields).toBe(2);
        expect(p.health).toBe(5);
    });
});

describe('checkDeath', () => {
    test('should not mark alive player as dead', () => {
        const p = makePlayer({ health: 1 });
        expect(checkDeath(p)).toBe(false);
        expect(p.isGhost).toBe(false);
    });

    test('should mark dead player as ghost and clear stats', () => {
        const p = makePlayer({ health: 0, shields: 3, aptokens: 2, hptokens: 2 });
        p.passives.brilliance = true;
        expect(checkDeath(p)).toBe(true);
        expect(p.isGhost).toBe(true);
        expect(p.shields).toBe(0);
        expect(p.aptokens).toBe(0);
        expect(p.hptokens).toBe(0);
        expect(p.passives.brilliance).toBe(false);
    });
});

describe('isGameOver', () => {
    test('should not end game with 2 alive players', () => {
        const state = { players: [makePlayer(), makePlayer({ id: 2 })], history: [] };
        isGameOver(state);
        expect(state.gameOver).not.toBe(true);
    });

    test('should end game with 1 alive player', () => {
        const state = {
            players: [makePlayer(), makePlayer({ id: 2, health: 0, isGhost: true })],
            gameOn: true, gameOver: false, winner: null, history: []
        };
        isGameOver(state);
        expect(state.gameOver).toBe(true);
        expect(state.winner.id).toBe(1);
    });
});

describe('shuffle', () => {
    test('should preserve array length', () => {
        const arr = [1, 2, 3, 4, 5];
        shuffle(arr);
        expect(arr).toHaveLength(5);
    });

    test('should contain same elements', () => {
        const arr = [1, 2, 3, 4, 5];
        shuffle(arr);
        expect(arr.sort()).toEqual([1, 2, 3, 4, 5]);
    });
});

describe('sanitizeState', () => {
    test('should strip deck internals', () => {
        const state = {
            gameboard: {
                grid: [[{ elem: 'fire', faceUp: true }]],
                deck: { cards: [1, 2, 3], discard: [] },
                spellDeck: { cards: [1, 2], discard: [] }
            },
            players: [], history: []
        };
        const clean = sanitizeState(state);
        expect(clean.gameboard.deck.remaining).toBe(3);
        expect(clean.gameboard.spellDeck.remaining).toBe(2);
        expect(clean.gameboard.deck.cards).toBeUndefined();
        expect(clean.gameboard.grid).toBe(state.gameboard.grid);
    });

    test('should handle null gameboard', () => {
        const clean = sanitizeState({ players: [], history: [] });
        expect(clean.gameboard).toBeUndefined();
    });
});

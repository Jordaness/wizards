const { isActorLegit, isCurrentTurnPlayer, isSafeValue, areSafeCoords, playerOwnsSpell, isValidTarget, isPlayerAlive } = require('./validate');

function makeState(players, currentTurn) {
    return { players: players || [], currentTurn: currentTurn !== undefined ? currentTurn : null };
}

function makePlayer(overrides = {}) {
    return Object.assign({
        id: 1, socketid: 'sock1', name: 'Wiz', isGhost: false, spells: []
    }, overrides);
}

describe('isActorLegit', () => {
    test('should return true for valid actor matching socket', () => {
        const state = makeState([makePlayer({ id: 1, socketid: 'abc' })]);
        const payload = { actor: { socketid: 'abc' } };
        const socket = { id: 'abc' };
        expect(isActorLegit(payload, socket, state)).toBe(true);
    });

    test('should return false when payload is null', () => {
        const state = makeState([makePlayer()]);
        expect(isActorLegit(null, { id: 'abc' }, state)).toBe(false);
    });

    test('should return false when actor is missing', () => {
        const state = makeState([makePlayer()]);
        expect(isActorLegit({}, { id: 'abc' }, state)).toBe(false);
    });

    test('should return false when actor socketid does not match socket', () => {
        const state = makeState([makePlayer({ socketid: 'abc' })]);
        const payload = { actor: { socketid: 'abc' } };
        const socket = { id: 'xyz' };
        expect(isActorLegit(payload, socket, state)).toBe(false);
    });

    test('should return false when socket id not in players list', () => {
        const state = makeState([makePlayer({ socketid: 'other' })]);
        const payload = { actor: { socketid: 'abc' } };
        const socket = { id: 'abc' };
        expect(isActorLegit(payload, socket, state)).toBe(false);
    });
});

describe('isCurrentTurnPlayer', () => {
    test('should return true when socket matches current turn player', () => {
        const state = makeState([makePlayer({ socketid: 'abc' }), makePlayer({ id: 2, socketid: 'def' })], 0);
        expect(isCurrentTurnPlayer({ id: 'abc' }, state)).toBe(true);
    });

    test('should return false when socket does not match current turn', () => {
        const state = makeState([makePlayer({ socketid: 'abc' }), makePlayer({ id: 2, socketid: 'def' })], 1);
        expect(isCurrentTurnPlayer({ id: 'abc' }, state)).toBe(false);
    });

    test('should return false when currentTurn is null', () => {
        const state = makeState([makePlayer()], null);
        expect(isCurrentTurnPlayer({ id: 'sock1' }, state)).toBe(false);
    });
});

describe('isSafeValue', () => {
    test('should return true for value in range', () => {
        expect(isSafeValue(5, 1, 10)).toBe(true);
    });

    test('should return true for boundary values', () => {
        expect(isSafeValue(1, 1, 10)).toBe(true);
        expect(isSafeValue(10, 1, 10)).toBe(true);
    });

    test('should return false for value below range', () => {
        expect(isSafeValue(0, 1, 10)).toBe(false);
    });

    test('should return false for value above range', () => {
        expect(isSafeValue(11, 1, 10)).toBe(false);
    });

    test('should return false for non-number', () => {
        expect(isSafeValue('5', 1, 10)).toBe(false);
    });

    test('should return false for NaN', () => {
        expect(isSafeValue(NaN, 1, 10)).toBe(false);
    });

    test('should return false for Infinity', () => {
        expect(isSafeValue(Infinity, 1, 10)).toBe(false);
    });
});

describe('areSafeCoords', () => {
    test('should return true for valid coords', () => {
        expect(areSafeCoords([[0, 0], [3, 3]])).toBe(true);
    });

    test('should return false for empty array', () => {
        expect(areSafeCoords([])).toBe(false);
    });

    test('should return false for non-array', () => {
        expect(areSafeCoords('bad')).toBe(false);
    });

    test('should return false for out of bounds coords', () => {
        expect(areSafeCoords([[4, 0]])).toBe(false);
        expect(areSafeCoords([[0, -1]])).toBe(false);
    });

    test('should return false for non-integer coords', () => {
        expect(areSafeCoords([[1.5, 2]])).toBe(false);
    });

    test('should return false for wrong length inner array', () => {
        expect(areSafeCoords([[1]])).toBe(false);
        expect(areSafeCoords([[1, 2, 3]])).toBe(false);
    });
});

describe('playerOwnsSpell', () => {
    test('should return true when player owns the spell', () => {
        const state = makeState([makePlayer({ id: 1, spells: [{ name: 'Fireball' }] })]);
        expect(playerOwnsSpell({ id: 1 }, 'Fireball', state)).toBe(true);
    });

    test('should return false when player does not own the spell', () => {
        const state = makeState([makePlayer({ id: 1, spells: [{ name: 'Heal' }] })]);
        expect(playerOwnsSpell({ id: 1 }, 'Fireball', state)).toBe(false);
    });

    test('should return false when player not found', () => {
        const state = makeState([makePlayer({ id: 1 })]);
        expect(playerOwnsSpell({ id: 99 }, 'Fireball', state)).toBe(false);
    });

    test('should return false when spells is empty', () => {
        const state = makeState([makePlayer({ id: 1, spells: [] })]);
        expect(playerOwnsSpell({ id: 1 }, 'Fireball', state)).toBe(false);
    });
});

describe('isValidTarget', () => {
    test('should return true for valid target', () => {
        const state = makeState([makePlayer({ id: 1 }), makePlayer({ id: 2 })]);
        expect(isValidTarget({ id: 2 }, state)).toBe(true);
    });

    test('should return false for null target', () => {
        const state = makeState([makePlayer()]);
        expect(isValidTarget(null, state)).toBe(false);
    });

    test('should return false for non-object target', () => {
        const state = makeState([makePlayer()]);
        expect(isValidTarget('bad', state)).toBe(false);
    });

    test('should return false for target not in players', () => {
        const state = makeState([makePlayer({ id: 1 })]);
        expect(isValidTarget({ id: 99 }, state)).toBe(false);
    });
});

describe('isPlayerAlive', () => {
    test('should return true for alive player', () => {
        const state = makeState([makePlayer({ id: 1, isGhost: false })]);
        expect(isPlayerAlive({ id: 1 }, state)).toBe(true);
    });

    test('should return false for ghost player', () => {
        const state = makeState([makePlayer({ id: 1, isGhost: true })]);
        expect(isPlayerAlive({ id: 1 }, state)).toBe(false);
    });

    test('should return false for null target', () => {
        const state = makeState([makePlayer()]);
        expect(isPlayerAlive(null, state)).toBe(false);
    });

    test('should return false for target not in players', () => {
        const state = makeState([makePlayer({ id: 1 })]);
        expect(isPlayerAlive({ id: 99 }, state)).toBe(false);
    });
});

const { gameApp } = require('./reducers');
const actions = require('./actions');

function makePlayer(overrides = {}) {
    return Object.assign({
        id: 1, socketid: 'sock1', name: 'Wiz1', health: 5, shields: 0,
        aptokens: 0, hptokens: 0, isGhost: false, ready: false,
        adjustActions: 0, spells: [],
        passives: { overdrive: false, hypermetabolism: false, telepathy: false, brilliance: false }
    }, overrides);
}

describe('reducer ADD_PLAYER', () => {
    test('should add a player to empty state', () => {
        const state = gameApp(undefined, actions.addPlayer('sock1', 'Merlin'));
        expect(state.players).toHaveLength(1);
        expect(state.players[0].name).toBe('Merlin');
        expect(state.nextPlayer).toBe(2);
    });

    test('should add multiple players', () => {
        let state = gameApp(undefined, actions.addPlayer('sock1', 'Merlin'));
        state = gameApp(state, actions.addPlayer('sock2', 'Gandalf'));
        expect(state.players).toHaveLength(2);
        expect(state.players[1].name).toBe('Gandalf');
        expect(state.nextPlayer).toBe(3);
    });
});

describe('reducer READY', () => {
    test('should mark player as ready', () => {
        let state = gameApp(undefined, actions.addPlayer('sock1', 'Merlin'));
        const player = state.players[0];
        state = gameApp(state, actions.ready(player));
        expect(state.players[0].ready).toBe(true);
    });
});

describe('reducer REMOVE_PLAYER', () => {
    test('should remove player from state', () => {
        let state = gameApp(undefined, actions.addPlayer('sock1', 'Merlin'));
        state = gameApp(state, actions.addPlayer('sock2', 'Gandalf'));
        const player = state.players[0];
        state = gameApp(state, actions.removePlayer(player));
        expect(state.players).toHaveLength(1);
        expect(state.players[0].name).toBe('Gandalf');
    });

    test('should adjust currentTurn when removing player before current', () => {
        let state = gameApp(undefined, actions.addPlayer('sock1', 'Merlin'));
        state = gameApp(state, actions.addPlayer('sock2', 'Gandalf'));
        state = gameApp(state, actions.addPlayer('sock3', 'Rincewind'));
        state = Object.assign({}, state, { currentTurn: 2 });
        const firstPlayer = state.players[0];
        state = gameApp(state, actions.removePlayer(firstPlayer));
        expect(state.currentTurn).toBe(1);
    });

    test('should return original state when player not found', () => {
        let state = gameApp(undefined, actions.addPlayer('sock1', 'Merlin'));
        const fakePlayer = { id: 999, name: 'Nobody' };
        const result = gameApp(state, actions.removePlayer(fakePlayer));
        expect(result.players).toHaveLength(1);
    });
});

describe('reducer TURN_END', () => {
    test('should skip ghost players when advancing turn', () => {
        let state = gameApp(undefined, actions.addPlayer('sock1', 'Alive1'));
        state = gameApp(state, actions.addPlayer('sock2', 'Ghost'));
        state = gameApp(state, actions.addPlayer('sock3', 'Alive2'));
        state = Object.assign({}, state, { currentTurn: 0, gameOn: true });
        // Make player 2 a ghost
        state.players[1].isGhost = true;
        state = gameApp(state, actions.turnEnd());
        // Should skip ghost at index 1 and land on index 2
        expect(state.currentTurn).toBe(2);
    });

    test('should process burn damage from negative hptokens', () => {
        let state = gameApp(undefined, actions.addPlayer('sock1', 'Burner'));
        state = gameApp(state, actions.addPlayer('sock2', 'Other'));
        state = Object.assign({}, state, { currentTurn: 0, gameOn: true });
        state.players[0].hptokens = -1;
        state = gameApp(state, actions.turnEnd());
        expect(state.players[0].health).toBe(4);
    });

    test('should process regen from positive hptokens', () => {
        let state = gameApp(undefined, actions.addPlayer('sock1', 'Healer'));
        state = gameApp(state, actions.addPlayer('sock2', 'Other'));
        state = Object.assign({}, state, { currentTurn: 0, gameOn: true });
        state.players[0].health = 3;
        state.players[0].hptokens = 1;
        state = gameApp(state, actions.turnEnd());
        expect(state.players[0].health).toBe(4);
        expect(state.players[0].hptokens).toBe(0);
    });
});

describe('reducer TURN_START', () => {
    test('should process positive aptokens', () => {
        let state = gameApp(undefined, actions.addPlayer('sock1', 'Hasted'));
        state = gameApp(state, actions.addPlayer('sock2', 'Other'));
        state = Object.assign({}, state, { currentTurn: 0, gameOn: true });
        state.players[0].aptokens = 1;
        // Need a gameboard for brilliance check
        state.gameboard = { spellDeck: { topCard: () => null } };
        state = gameApp(state, actions.turnStart());
        expect(state.players[0].adjustActions).toBe(1);
        expect(state.players[0].aptokens).toBe(0);
    });

    test('should process negative aptokens', () => {
        let state = gameApp(undefined, actions.addPlayer('sock1', 'Slowed'));
        state = gameApp(state, actions.addPlayer('sock2', 'Other'));
        state = Object.assign({}, state, { currentTurn: 0, gameOn: true });
        state.players[0].aptokens = -1;
        state.gameboard = { spellDeck: { topCard: () => null } };
        state = gameApp(state, actions.turnStart());
        expect(state.players[0].adjustActions).toBe(-1);
        expect(state.players[0].aptokens).toBe(0);
    });
});

describe('reducer RESET_ADJUST', () => {
    test('should decrement positive adjustActions', () => {
        let state = gameApp(undefined, actions.addPlayer('sock1', 'Wiz'));
        state = Object.assign({}, state, { currentTurn: 0 });
        state.players[0].adjustActions = 2;
        state = gameApp(state, actions.resetAdjust(state.players[0]));
        expect(state.players[0].adjustActions).toBe(1);
    });

    test('should set 0 when adjustActions is 0', () => {
        let state = gameApp(undefined, actions.addPlayer('sock1', 'Wiz'));
        state = Object.assign({}, state, { currentTurn: 0 });
        state.players[0].adjustActions = 0;
        state = gameApp(state, actions.resetAdjust(state.players[0]));
        expect(state.players[0].adjustActions).toBe(0);
    });
});

describe('reducer default', () => {
    test('should return state for unknown action', () => {
        const state = gameApp(undefined, { type: 'UNKNOWN_ACTION' });
        expect(state).toBeTruthy();
        expect(state.players).toEqual([]);
    });
});

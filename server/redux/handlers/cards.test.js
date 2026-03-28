const { handleDivine, handleUnhighlight, handleWeave, handleScry, handleObscure, handleReplaceElements } = require('./cards');

function makeGrid() {
    return [
        [{ elem: 'fire', faceUp: false }, { elem: 'water', faceUp: false }, { elem: 'earth', faceUp: false }, { elem: 'air', faceUp: false }],
        [{ elem: 'air', faceUp: false }, { elem: 'fire', faceUp: true }, { elem: 'water', faceUp: true }, { elem: 'earth', faceUp: false }],
        [{ elem: 'water', faceUp: false }, { elem: 'earth', faceUp: true }, { elem: 'air', faceUp: true }, { elem: 'fire', faceUp: false }],
        [{ elem: 'earth', faceUp: false }, { elem: 'air', faceUp: false }, { elem: 'fire', faceUp: false }, { elem: 'water', faceUp: false }]
    ];
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

function makeState(deckCards) {
    return {
        gameboard: { grid: makeGrid(), deck: makeDeck(deckCards) },
        history: [], highlight: []
    };
}

describe('handleDivine', () => {
    test('should highlight cards and add message', () => {
        const s = makeState();
        const r = handleDivine(s, { yx: [[0, 0], [0, 1]], message: 'divine msg' });
        expect(r.highlight).toHaveLength(2);
        expect(r.history).toContain('divine msg');
    });
});

describe('handleUnhighlight', () => {
    test('should clear highlights', () => {
        const s = makeState();
        s.highlight = [[0, 0]];
        const r = handleUnhighlight(s, {});
        expect(r.highlight).toHaveLength(0);
    });
});

describe('handleWeave', () => {
    test('should swap two cards on the grid', () => {
        const s = makeState();
        const origElem00 = s.gameboard.grid[0][0].elem;
        const origElem33 = s.gameboard.grid[3][3].elem;
        const r = handleWeave(s, { yx1: [0, 0], yx2: [3, 3], message: 'weave msg' });
        expect(r.gameboard.grid[0][0].elem).toBe(origElem33);
        expect(r.gameboard.grid[3][3].elem).toBe(origElem00);
    });
});

describe('handleScry', () => {
    test('should set cards face up', () => {
        const s = makeState();
        expect(s.gameboard.grid[0][0].faceUp).toBe(false);
        const r = handleScry(s, { yx: [[0, 0], [3, 3]], message: 'scry msg' });
        expect(r.gameboard.grid[0][0].faceUp).toBe(true);
        expect(r.gameboard.grid[3][3].faceUp).toBe(true);
    });
});

describe('handleObscure', () => {
    test('should set cards face down', () => {
        const s = makeState();
        s.gameboard.grid[1][1].faceUp = true;
        const r = handleObscure(s, { yx: [[1, 1]], message: 'obscure msg' });
        expect(r.gameboard.grid[1][1].faceUp).toBe(false);
    });
});

describe('handleReplaceElements', () => {
    test('should replace grid cards from deck', () => {
        const newCard = { elem: 'aether', faceUp: false };
        const s = makeState([newCard]);
        const oldCard = s.gameboard.grid[0][0];
        const r = handleReplaceElements(s, { yx: [[0, 0]] });
        expect(r.gameboard.grid[0][0].elem).toBe('aether');
        expect(r.gameboard.deck.discard).toContain(oldCard);
    });

    test('should set central cards face up', () => {
        const newCard = { elem: 'aether', faceUp: false };
        const s = makeState([newCard]);
        const r = handleReplaceElements(s, { yx: [[1, 1]] });
        expect(r.gameboard.grid[1][1].faceUp).toBe(true);
    });

    test('should skip replacement when deck is empty', () => {
        const s = makeState([]);
        const origCard = s.gameboard.grid[0][0];
        const r = handleReplaceElements(s, { yx: [[0, 0]] });
        expect(r.gameboard.grid[0][0]).toBe(origCard);
    });
});

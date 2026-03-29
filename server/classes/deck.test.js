const Deck = require('./deck');

describe('Deck constructor', () => {
    test('should initialize with empty cards and discard', () => {
        const d = new Deck();
        expect(d.cards).toEqual([]);
        expect(d.discard).toEqual([]);
    });
});

describe('initializeAsElementDeck', () => {
    test('should create 52 element cards', () => {
        const d = new Deck();
        d.initializeAsElementDeck();
        expect(d.cards).toHaveLength(52);
    });

    test('should contain 11 of each standard element and 8 aether', () => {
        const d = new Deck();
        d.initializeAsElementDeck();
        const counts = {};
        for (const card of d.cards) {
            counts[card.elem] = (counts[card.elem] || 0) + 1;
        }
        expect(counts['air']).toBe(11);
        expect(counts['earth']).toBe(11);
        expect(counts['fire']).toBe(11);
        expect(counts['water']).toBe(11);
        expect(counts['aether']).toBe(8);
    });
});

describe('initializeAsSpellDeck', () => {
    test('should create spell cards', () => {
        const d = new Deck();
        d.initializeAsSpellDeck();
        expect(d.cards.length).toBeGreaterThan(0);
    });

    test('all spell cards should have name and effects', () => {
        const d = new Deck();
        d.initializeAsSpellDeck();
        for (const card of d.cards) {
            expect(card.name).toBeDefined();
            expect(card.effects).toBeDefined();
        }
    });
});

describe('topCard', () => {
    test('should return and remove top card', () => {
        const d = new Deck();
        d.cards = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
        const card = d.topCard();
        expect(card.name).toBe('C');
        expect(d.cards).toHaveLength(2);
    });

    test('should shuffle discard into cards when empty', () => {
        const d = new Deck();
        d.cards = [];
        d.discard = [{ name: 'X' }, { name: 'Y' }];
        const card = d.topCard();
        expect(card).toBeTruthy();
        expect(d.discard).toHaveLength(0);
    });

    test('should return null when both cards and discard are empty', () => {
        const d = new Deck();
        d.cards = [];
        d.discard = [];
        const card = d.topCard();
        expect(card).toBeNull();
    });
});

describe('shuffle', () => {
    test('should move discard into cards', () => {
        const d = new Deck();
        d.cards = [{ name: 'A' }];
        d.discard = [{ name: 'B' }, { name: 'C' }];
        d.shuffle();
        expect(d.cards).toHaveLength(3);
        expect(d.discard).toHaveLength(0);
    });

    test('should preserve total card count', () => {
        const d = new Deck();
        d.initializeAsElementDeck();
        const originalCount = d.cards.length;
        d.shuffle();
        expect(d.cards).toHaveLength(originalCount);
    });
});

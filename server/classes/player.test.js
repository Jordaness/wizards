const Player = require('./player');

describe('Player constructor', () => {
    test('should initialize with correct defaults', () => {
        const p = new Player(1, 'sock1', 'Merlin');
        expect(p.id).toBe(1);
        expect(p.name).toBe('Merlin');
        expect(p.health).toBe(5);
        expect(p.isGhost).toBe(false);
        expect(p.shields).toBe(0);
        expect(p.spells).toEqual([]);
        expect(p.ready).toBe(false);
    });
});

describe('processApTokens', () => {
    test('should consume 1 haste token without overdrive', () => {
        const p = new Player(1, 's', 'Wiz');
        p.aptokens = 2;
        const msgs = p.processApTokens();
        expect(p.adjustActions).toBe(1);
        expect(p.aptokens).toBe(1);
        expect(msgs).toHaveLength(1);
    });

    test('should consume 2 haste tokens with overdrive', () => {
        const p = new Player(1, 's', 'Wiz');
        p.aptokens = 2;
        p.passives.overdrive = true;
        const msgs = p.processApTokens();
        expect(p.adjustActions).toBe(2);
        expect(p.aptokens).toBe(0);
        expect(msgs[0]).toContain('Overdrive');
    });

    test('should handle negative aptokens', () => {
        const p = new Player(1, 's', 'Wiz');
        p.aptokens = -1;
        const msgs = p.processApTokens();
        expect(p.adjustActions).toBe(-1);
        expect(p.aptokens).toBe(0);
        expect(msgs).toHaveLength(1);
    });

    test('should do nothing with zero aptokens', () => {
        const p = new Player(1, 's', 'Wiz');
        p.aptokens = 0;
        const msgs = p.processApTokens();
        expect(p.adjustActions).toBe(0);
        expect(msgs).toHaveLength(0);
    });
});

describe('processHpTokens', () => {
    test('should heal 1 with positive hptokens', () => {
        const p = new Player(1, 's', 'Wiz');
        p.health = 3;
        p.hptokens = 1;
        const r = p.processHpTokens();
        expect(p.health).toBe(4);
        expect(p.hptokens).toBe(0);
        expect(r.tookDamage).toBe(false);
    });

    test('should heal 2 with hypermetabolism', () => {
        const p = new Player(1, 's', 'Wiz');
        p.health = 3;
        p.hptokens = 2;
        p.passives.hypermetabolism = true;
        const r = p.processHpTokens();
        expect(p.health).toBe(5);
        expect(p.hptokens).toBe(0);
    });

    test('should consume token at max health without overhealing', () => {
        const p = new Player(1, 's', 'Wiz');
        p.health = 5;
        p.hptokens = 1;
        p.processHpTokens();
        expect(p.health).toBe(5);
        expect(p.hptokens).toBe(0);
    });

    test('should take damage with negative hptokens and no shields', () => {
        const p = new Player(1, 's', 'Wiz');
        p.hptokens = -1;
        const r = p.processHpTokens();
        expect(p.health).toBe(4);
        expect(p.hptokens).toBe(0);
        expect(r.tookDamage).toBe(true);
    });

    test('should absorb burn with shields', () => {
        const p = new Player(1, 's', 'Wiz');
        p.hptokens = -1;
        p.shields = 2;
        const r = p.processHpTokens();
        expect(p.health).toBe(5);
        expect(p.shields).toBe(1);
        expect(r.tookDamage).toBe(false);
    });

    test('should do nothing with zero hptokens', () => {
        const p = new Player(1, 's', 'Wiz');
        p.hptokens = 0;
        const r = p.processHpTokens();
        expect(p.health).toBe(5);
        expect(r.messages).toHaveLength(0);
    });
});

describe('Player.reset', () => {
    test('should reset all fields to defaults', () => {
        const p = new Player(1, 's', 'Wiz');
        p.health = 1;
        p.shields = 3;
        p.isGhost = true;
        p.aptokens = 5;
        p.hptokens = -2;
        p.passives.brilliance = true;
        p.spells = ['a', 'b'];
        p.reset();
        expect(p.health).toBe(5);
        expect(p.shields).toBe(0);
        expect(p.isGhost).toBe(false);
        expect(p.aptokens).toBe(0);
        expect(p.hptokens).toBe(0);
        expect(p.passives.brilliance).toBe(false);
        expect(p.spells).toHaveLength(0);
        expect(p.ready).toBe(false);
    });
});

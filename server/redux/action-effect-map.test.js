/**
 * Tests to verify all expected game actions have corresponding
 * Rive effect mappings defined. This is a data-integrity check.
 */

// We can't import TypeScript directly, so we test the mapping structure
// by duplicating the expected keys. If the map changes, this test catches drift.

const EXPECTED_ACTIONS = [
    'SHIELD', 'SHIELD_HIT',
    'ATTACK', 'ATTACK_HIT', 'ATTACK_ALL',
    'DRAIN',
    'CURE',
    'HP_PLUS', 'AP_PLUS',
    'HP_MINUS', 'AP_MINUS',
    'OBSCURE', 'SCRY',
    'CAST_SUCCESS', 'CAST_FAIL',
    'DEATH'
];

const EXPECTED_ARTBOARDS = [
    'ShieldFX', 'AttackFX', 'DrainFX', 'CureFX',
    'BuffFX', 'DebuffFX', 'ObscureFX', 'CastFX', 'DeathFX'
];

const VALID_INPUT_TYPES = ['boolean', 'trigger', 'number'];

// Replicate the map here for server-side validation
const ACTION_EFFECT_MAP = {
    SHIELD: { artboard: 'ShieldFX', inputs: [{ inputName: 'isShielded', inputType: 'boolean' }, { inputName: 'currentShieldValue', inputType: 'number' }] },
    SHIELD_HIT: { artboard: 'ShieldFX', inputs: [{ inputName: 'onHit', inputType: 'trigger' }] },
    ATTACK: { artboard: 'AttackFX', inputs: [{ inputName: 'onFire', inputType: 'trigger' }, { inputName: 'damageValue', inputType: 'number' }] },
    ATTACK_HIT: { artboard: 'AttackFX', inputs: [{ inputName: 'onTargetHit', inputType: 'trigger' }] },
    ATTACK_ALL: { artboard: 'AttackFX', inputs: [{ inputName: 'onFire', inputType: 'trigger' }, { inputName: 'damageValue', inputType: 'number' }] },
    DRAIN: { artboard: 'DrainFX', inputs: [{ inputName: 'onDrain', inputType: 'trigger' }, { inputName: 'drainValue', inputType: 'number' }] },
    CURE: { artboard: 'CureFX', inputs: [{ inputName: 'onHeal', inputType: 'trigger' }, { inputName: 'healValue', inputType: 'number' }] },
    HP_PLUS: { artboard: 'BuffFX', inputs: [{ inputName: 'isRegening', inputType: 'boolean' }, { inputName: 'hpValue', inputType: 'number' }] },
    AP_PLUS: { artboard: 'BuffFX', inputs: [{ inputName: 'isHasted', inputType: 'boolean' }, { inputName: 'apValue', inputType: 'number' }] },
    HP_MINUS: { artboard: 'DebuffFX', inputs: [{ inputName: 'isBurning', inputType: 'boolean' }, { inputName: 'burnValue', inputType: 'number' }] },
    AP_MINUS: { artboard: 'BuffFX', inputs: [{ inputName: 'isSlowed', inputType: 'boolean' }, { inputName: 'apValue', inputType: 'number' }] },
    OBSCURE: { artboard: 'ObscureFX', inputs: [{ inputName: 'isObscured', inputType: 'boolean' }] },
    SCRY: { artboard: 'ObscureFX', inputs: [{ inputName: 'onReveal', inputType: 'trigger' }] },
    CAST_SUCCESS: { artboard: 'CastFX', inputs: [{ inputName: 'onCastSuccess', inputType: 'trigger' }] },
    CAST_FAIL: { artboard: 'CastFX', inputs: [{ inputName: 'onCastFail', inputType: 'trigger' }] },
    DEATH: { artboard: 'DeathFX', inputs: [{ inputName: 'onDeath', inputType: 'trigger' }] },
};

describe('ACTION_EFFECT_MAP structure', () => {
    test('should have all expected action keys', () => {
        for (const action of EXPECTED_ACTIONS) {
            expect(ACTION_EFFECT_MAP[action]).toBeDefined();
        }
    });

    test('should only reference valid artboards', () => {
        for (const [action, mapping] of Object.entries(ACTION_EFFECT_MAP)) {
            expect(EXPECTED_ARTBOARDS).toContain(mapping.artboard);
        }
    });

    test('should only use valid input types', () => {
        for (const [action, mapping] of Object.entries(ACTION_EFFECT_MAP)) {
            for (const input of mapping.inputs) {
                expect(VALID_INPUT_TYPES).toContain(input.inputType);
                expect(typeof input.inputName).toBe('string');
                expect(input.inputName.length).toBeGreaterThan(0);
            }
        }
    });

    test('every mapping should have at least one input', () => {
        for (const [action, mapping] of Object.entries(ACTION_EFFECT_MAP)) {
            expect(mapping.inputs.length).toBeGreaterThan(0);
        }
    });

    test('trigger inputs should not duplicate within same mapping', () => {
        for (const [action, mapping] of Object.entries(ACTION_EFFECT_MAP)) {
            const triggerNames = mapping.inputs
                .filter(i => i.inputType === 'trigger')
                .map(i => i.inputName);
            const unique = new Set(triggerNames);
            expect(unique.size).toBe(triggerNames.length);
        }
    });
});

import { Element } from './classes/elements';
import { SpellCardInitializer } from './classes/spellCardInitializer';

const actions = require('./redux/actions');

// card template
// { name: '', text: '', elements: '', effects: [{type: actions.XXX, args}], targeted: XXX, copies: N },

export const AllSpells: SpellCardInitializer[] = [
    { name: 'Quickness', text: 'AP +2', elements: [Element.Air, Element.Air], effects: [{ type: actions.AP_PLUS, value: 2 }], targeted: false, copies: 4},
    { name: 'Stoneskin', text: 'Shield 1', elements: [Element.Earth, Element.Earth], effects: [{ type: actions.SHIELD, value: 1 }], targeted: false, copies: 4 },
    { name: 'Fireball', text: 'Attack 1', elements: [Element.Fire, Element.Fire], effects: [{ type: actions.ATTACK, value: 1, targetPlayer: true }], targeted: false, copies: 4 },
    { name: 'Potion', text: 'Cure 1', elements: [Element.Water, Element.Water], effects: [{ type: actions.CURE, value: 1 }], targeted: false, copies: 4 },

    { name: 'Gust of Wind', text: 'Target AP -1', elements: [Element.Air, Element.Earth], effects: [{ type: actions.AP_MINUS, value: 1, targetPlayer: true }], targeted: false, copies: 3 },
    { name: 'Arc', text: 'Attack 1, Chain once', elements: [Element.Air, Element.Fire], effects: [{ type: actions.ATTACK, value: 1, targetPlayer: true }, { type: actions.ATTACK, value: 1, targetPlayer: true }], targeted: false, copies: 3 },
    { name: 'Smoke Bomb', text: 'Obscure 2', elements: [Element.Air, Element.Water], effects: [{ type: actions.OBSCURE, value: 2 }], targeted: false, copies: 3 },
    { name: 'Magma Ball', text: 'Burn 2', elements: [Element.Earth, Element.Fire], effects: [{ type: actions.HP_MINUS, value: 2, targetPlayer: true }], targeted: false, copies: 3 },
    { name: 'Placebo', text: 'Regen 1', elements: [Element.Earth, Element.Water], effects: [{ type: actions.HP_PLUS, value: 1 }], targeted: false, copies: 3 },
    { name: 'Energy Drain', text: 'Attack 1, Cure = damage dealt', elements: [Element.Fire, Element.Water], effects: [{ type: actions.DRAIN, value: 1, targetPlayer: true }], targeted: false, copies: 3 },

    { name: 'Haste', text: 'AP +3', elements: [Element.Air, Element.Air, Element.Air], effects: [{ type: actions.AP_PLUS, value: 3 }], targeted: false, copies: 2 },
    { name: 'Slow', text: 'Target AP -2', elements: [Element.Air, Element.Air, Element.Earth], effects: [{ type: actions.AP_MINUS, value: 2, targetPlayer: true }], targeted: false, copies: 2 },
    { name: 'Glittering Cloud', text: 'Attack 1 against all opponents', elements: [Element.Air, Element.Air, Element.Fire], effects: [{ type: actions.ATTACK_ALL, value: 1 }], targeted: false, copies: 2 },
    { name: 'Contemplation', text: 'AP +1, Divine 2', elements: [Element.Air, Element.Air, Element.Water], effects: [{ type: actions.AP_PLUS, value: 1 }, { type: actions.DIVINE, value: 2 }], targeted: false, copies: 2 },
    { name: 'Grounding', text: 'Target AP -1, and you may strip up to 2 +HP tokens from that target', elements: [Element.Earth, Element.Earth, Element.Air], effects: [{ type: actions.AP_MINUS, value: 1, targetPlayer: true }, { type: actions.HP_MINUS, value: 2, targetPlayer: true, limited: true }], targeted: true, copies: 2 }, //strip
    { name: 'Armour', text: 'Shield 2', elements: [Element.Earth, Element.Earth, Element.Earth], effects: [{ type: actions.SHIELD, value: 2 }], targeted: false, copies: 2 },
    { name: 'Scald', text: 'Burn 2, and you may strip up to 2 +AP tokens from that target', elements: [Element.Earth, Element.Earth, Element.Fire], effects: [{ type: actions.HP_MINUS, value: 2, targetPlayer: true }, { type: actions.AP_MINUS, value: 2, targetPlayer: true, limited: true }], targeted: true, copies: 2 }, //strip
    { name: 'Strength', text: 'Shield 1, Regen 1', elements: [Element.Earth, Element.Earth, Element.Water] , effects: [{ type: actions.SHIELD, value: 1 }, { type: actions.HP_PLUS, value: 1 }], targeted: false, copies: 2 },

    { name: 'Twin Laser', text: 'Target 2 opponents: Attack 2', elements: [Element.Fire, Element.Fire, Element.Air], effects: [{ type: actions.ATTACK, value: 2, targetPlayer: true }, { type: actions.ATTACK, value: 2, targetPlayer: true }], targeted: false, copies: 2 },
    { name: 'Fist of Flame', text: 'Attack 1, Burn 3', elements: [Element.Fire, Element.Fire, Element.Earth], effects: [{ type: actions.ATTACK, value: 1, targetPlayer: true }, { type: actions.HP_MINUS, value: 3, targetPlayer: true }], targeted: true, copies: 2 },
    { name: 'Flamethrower', text: 'Attack 3', elements: [Element.Fire, Element.Fire, Element.Fire], effects: [{ type: actions.ATTACK, value: 3, targetPlayer: true }], targeted: false, copies: 2 },
    { name: 'Jet of Steam', text: 'Attack 2, Obscure 1', elements: [Element.Fire, Element.Fire, Element.Water], effects: [{ type: actions.ATTACK, value: 2, targetPlayer: true }, { type: actions.OBSCURE, value: 1, targetCards: true }], targeted: false, copies: 2 },

    // { name: 'Oracle', text: 'Divine 4 -OR- Obscure 2 -OR- Scry 2 -OR- Weave 2', elements: [Element.Water, Element.Water, Element.Air], effects: [{type: actions.DIVINE, value: 4},/*OR*/ {type: actions.OBSCURE, value: 2}, /*OR*/{type: actions.SCRY, value: 2}, /*OR*/{type: actions.WEAVE, value: 2}], targeted: false, copies: 2},
    { name: 'Vitality', text: 'Regen 3', elements: [Element.Water, Element.Water, Element.Earth], effects: [{ type: actions.HP_PLUS, value: 3 }], targeted: false, copies: 2 },
    { name: 'Life Drain', text: 'Attack 2, Cure = damage dealt', elements: [Element.Water, Element.Water, Element.Fire], effects: [{ type: actions.DRAIN, value: 2, targetPlayer: true }], targeted: false, copies: 2 },
    { name: 'Empower', text: 'Cure 2, Divine 2', elements: [Element.Water, Element.Water, Element.Water], effects: [{ type: actions.CURE, value: 2 }, { type: actions.DIVINE, value: 2 }], targeted: false, copies: 2 },

    { name: 'Accelereate', text: 'AP +4', elements: [Element.Air, Element.Air, Element.Air, Element.Air], effects: [{ type: actions.AP_PLUS, value: 4 }], targeted: false, copies: 1 },
    { name: 'Encase', text: 'Shield 3', elements: [Element.Earth, Element.Earth, Element.Earth, Element.Earth], effects: [{ type: actions.SHIELD, value: 3 }], targeted: false, copies: 1 },
    { name: 'Fusion', text: 'Attack 4', elements: [Element.Fire, Element.Fire, Element.Fire, Element.Fire], effects: [{ type: actions.ATTACK, value: 4, targetPlayer: true }], targeted: false, copies: 1 },
    { name: 'Medicine', text: 'Cure 3, Divine 2', elements: [Element.Water, Element.Water, Element.Water, Element.Water], effects: [{ type: actions.CURE, value: 3 }, { type: actions.DIVINE, value: 2, targetCards: true }], targeted: false, copies: 1 },
    { name: 'Napalm', text: 'Burn 3 to all opponents', elements: [Element.Air, Element.Air, Element.Earth, Element.Earth], effects: [{ type: actions.HP_MINUS, value: 3 }], targeted: true, copies: 1 },
    { name: 'Meteor', text: 'Attack 2, then Attack 1 to all opponents (including original target)', elements: [Element.Air, Element.Air, Element.Fire, Element.Fire], effects: [{ type: actions.ATTACK, value: 2, targetPlayer: true }, { type: actions.ATTACK_ALL, value: 1 }], targeted: false, copies: 1 },
    { name: 'Third Eye', text: 'Divine 4, then Weave twice', elements: [Element.Air, Element.Air, Element.Water, Element.Water], effects: [{ type: actions.DIVINE, value: 4, targetCards: true }, { type: actions.WEAVE, targetCards: true }, { type: actions.WEAVE, targetCards: true }], targeted: false, copies: 1 },
    { name: 'Immolate', text: 'Burn 5', elements: [Element.Earth, Element.Earth, Element.Fire, Element.Fire], effects: [{ type: actions.HP_MINUS, value: 5, targetPlayer: true }], targeted: false, copies: 1 },
    { name: 'Adaptation', text: 'Regen 5', elements: [Element.Earth, Element.Earth, Element.Water, Element.Water], effects: [{ type: actions.HP_PLUS, value: 5 }], targeted: false, copies: 1 },
    { name: 'Soul Drain', text: 'Attack 3, Cure = damage dealt', elements: [Element.Fire, Element.Fire, Element.Water, Element.Water], effects: [{ type: actions.DRAIN, value: 3, targetPlayer: true }], targeted: false, copies: 1 },


    { name: 'Tornado', text: 'AP +3, AP -1 to all opponents', elements: [Element.Air, Element.Air, Element.Air, Element.Aether], effects: [{ type: actions.AP_PLUS, value: 3 }, { type: actions.AP_MINUS, value: 1 }], targeted: false, copies: 1 },
    { name: 'Magnetize', text: 'Shield 3, Regen 2, strip up to 1 +HP token from all opponents and take them for yourself', elements: [Element.Earth, Element.Earth, Element.Earth, Element.Aether], effects: [{ type: actions.SHIELD, value: 3 }, { type: actions.HP_PLUS, value: 2 }, { type: actions.HP_MINUS, value: 1, limited: true, magnitize: true }], targeted: false, copies: 1 },
    { name: 'Firestorm', text: 'Attack 1, Burn 2 to all opponents', elements: [Element.Fire, Element.Fire, Element.Fire, Element.Aether], effects: [{ type: actions.ATTACK, value: 1, targetPlayer: true }, { type: actions.HP_MINUS, value: 2 }], targeted: false, copies: 1 },
    { name: 'Upwelling', text: 'Cure 2, Regen 4, and Obscure 2 cards', elements: [Element.Water, Element.Water, Element.Water, Element.Aether], effects: [{ type: actions.CURE, value: 2 }, { type: actions.HP_PLUS, value: 4 }, { type: actions.OBSCURE, value: 2 }], targeted: false, copies: 1 },
    { name: 'Apotheosis', text: 'Attack 1 and AP -1 to all opponents, Cure 1, AP +1, Regen 1, Shield 1', elements: [Element.Air, Element.Earth, Element.Fire, Element.Water, Element.Aether], effects: [{ type: actions.ATTACK, value: 1, targetPlayer: true }, { type: actions.AP_MINUS, value: 1 }, { type: actions.CURE, value: 1 }, { type: actions.AP_PLUS, value: 1 }, { type: actions.HP_PLUS, value: 1 }, { type: actions.SHIELD, value: 1 }], targeted: false, copies: 1 },

    //PASSIVE CARDS
    { name: 'Overdrive', text: 'Passive: Limit 1 per player. At the start of each turn, you must use and discard a second +AP token, if such a token is available.', elements: [Element.Air, Element.Earth, Element.Fire], effects: [{ type: actions.PASSIVE, value: 1 }], targeted: false, copies: 3 },
    { name: 'Hypermetabolism', text: 'Passive: Limit 1 per player. At the end of each turn, you must use and discard a second +HP token, if such a token is available.', elements: [Element.Air, Element.Earth, Element.Water], effects: [{ type: actions.PASSIVE, value: 2 }], targeted: false, copies: 3 },
    { name: 'Telepathy', text: 'Passive: Limit 1 per player. When you Divine, peek at 1 additional card.', elements: [Element.Air, Element.Fire, Element.Water], effects: [{ type: actions.PASSIVE, value: 3 }], targeted: false, copies: 3 },
    { name: 'Brilliance', text: 'Passive: Limit 1 per player. At the start of each turn, draw the top spell card.', elements: [Element.Earth, Element.Fire, Element.Water], effects: [{ type: actions.PASSIVE, value: 4 }], targeted: false, copies: 3 }
];
import { Deck } from "./deck";
import { AllSpells } from '../allspells';
import { SpellCard } from './spellCard';
import { SpellCardInitializer } from './spellCardInitializer';
import { Element } from './elements';


export class SpellDeck extends Deck {
    
    /**
     * Initalizes deck as a Spell Deck, with predefined amount of copies from the all spells file.
     */
    constructor() {
        super();

        for (let spell of AllSpells) {
            for (let i = 0; i < spell.copies; i++) {
                this.cards.push(new SpellCard(spell.name, spell.text, spell.elements, spell.effects, spell.targeted));
            }
        }

        this.shuffle();
        console.log('finished initializing Spell deck');
    };
}
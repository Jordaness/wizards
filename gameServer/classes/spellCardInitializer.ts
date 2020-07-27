import { SpellCard } from "./spellCard";

export class SpellCardInitializer extends SpellCard{

    public readonly copies: number;

    constructor(spell: SpellCard, copies: number){
        super(spell.name, spell.text, spell.elements, spell.effects, spell.targeted);
        this.copies = copies;
    }
}
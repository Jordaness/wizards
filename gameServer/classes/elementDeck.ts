import { Deck } from "./deck";
import { Element } from './elements';
import { ElementCard } from "./elementCard";

export class ElementDeck extends Deck {

    /**
     *Initializes a card deck as an Element Deck, creating 11 copies of each standard element plus 8 copies of 'aether'
     */
    constructor() {
        super();
        console.log('setting up element deck');

        for (let i = 0; i < 11; i++) {
            this.cards.push(new ElementCard(Element.Air));
            this.cards.push(new ElementCard(Element.Water));
            this.cards.push(new ElementCard(Element.Earth));
            this.cards.push(new ElementCard(Element.Fire));
        }

        for (let i = 0; i < 8; i++) {
            this.cards.push(new ElementCard(Element.Aether));
        };

        this.shuffle();
        console.log('finished initializing Element deck');
    };
}
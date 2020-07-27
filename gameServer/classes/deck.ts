import { ElementCard } from './elementCard';
import { SpellCard } from './spellCard';

type Card = ElementCard | SpellCard;

/**
 * Creates and manages a deck of cards.
 */
export abstract class Deck {
    
    protected cards: Card[];
    protected discard: Card[];

    /**
     * Creates a Deck with two piles, one for playable cards, and one for the extingushed cards.
     */
    constructor() {
        this.cards = [];
        this.discard = [];
    }

    /**
     * Draws the top card from the deck.
     */
    topCard() {
        let tempCard = this.cards.pop();
        if (this.cards.length == 0) {
            this.shuffle();
        }
        return tempCard;
    };

    /**
     * Shuffles the deck of cards, including the discard pile.
     */
    shuffle() {
        // pass in cards from discard
        while (this.discard[0] != null) {
            this.cards.push(this.discard.pop());
        };

        // shuffle everything together
        let m = this.cards.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = this.cards[m];
            this.cards[m] = this.cards[i];
            this.cards[i] = t;
        }
    };
}
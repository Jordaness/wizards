const ElementCard = require('./element.js');
const SpellCard = require('./spell.js');
const AllSpells = require('../allspells.js');

module.exports = class Deck {
    constructor() {
        this.cards = [];
        this.discard = [];
    }

    initializeAsElementDeck(){
        // create and push 11 copies of each standard element plus 8 copies of 'aether', then shuffle
        console.log('setting up element deck');
        for(let i = 0; i < 11; i++){
            this.cards.push(new ElementCard('air'));
            this.cards.push(new ElementCard('earth'));
            this.cards.push(new ElementCard('fire'));
            this.cards.push(new ElementCard('water'));
        }
        for(let i = 0; i < 8; i++){
            this.cards.push(new ElementCard('aether'));
        };
        this.shuffle();
        console.log('finished initializing Element deck');
    };

    initializeAsSpellDeck(){
        for(let spell of AllSpells){
            for(let i=0; i < spell.copies; i++){
                this.cards.push(new SpellCard(spell.name, spell.text, spell.elements, spell.effects, spell.targeted));
            }
        }
        this.shuffle();
        console.log('finished initializing Spell deck');
    };

    topCard(){
        if(this.cards.length == 0){
            this.shuffle();
        }
        if(this.cards.length == 0){
            console.log('WARNING: Deck is completely empty, no cards to draw!');
            return null;
        }
        return this.cards.pop();
    };

    shuffle(){ 
        // pass in cards from discard
        while(this.discard[0] != null){
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

    // detect empty this.cards and shuffle()

}

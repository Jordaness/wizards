module.exports = class Gameboard {
    constructor(elementDeck, spellDeck) {
        this.deck = elementDeck;
        this.spellDeck = spellDeck;
        this.grid = [[], [], [], []];
        // spell cards

        for (let y = 0; y < 4; y++) { // rows in grid
            for (let x = 0; x < 4; x++) { // columns in grid
                let drawnCard = this.deck.topCard();
                console.log(drawnCard);
                if ((y == 1 || y == 2) && (x == 1 || x == 2)) { // if one of the four central grid positions, make card faceup by default
                    drawnCard.faceUp = true;
                }
                this.grid[y].push(drawnCard);
            }
        }
    }

    // shuffle discards back into element deck
    shuffleElements() {
        this.deck.shuffle();
    }

    // shuffle spells back into spell deck
    shuffleSpells() {
        this.spellDeck.shuffle();
    }

    /*
    *
    * 
    *   vvv - ALL STATE-CHANGING FUNCTIONS DEPRECATED - vvv
    *
    *  
    */



    // weave - swap the positions of two cards
    weave(y1, x1, y2, x2) {
        console.log('Weaving ' + this.grid[y1][x1].elem + ' at ' + y1 + ', ' + x1 + ' and ' + this.grid[y2][x2].elem + ' at ' + y2 + ', ' + x2 + '...');
        // Weaving ELEMENT at y1, x1 and ELEMENT at y2, x2
        let temp = this.grid[y1][x1];
        this.grid[y1][x1] = this.grid[y2][x2];
        this.grid[y2][x2] = temp;
        console.log('*'.repeat(63));
        console.log('*'.repeat(25) + ' AFTER WEAVING ' + '*'.repeat('25'));
        this.printState();
    }

    // obscure - turn one card face down
    obscure(y, x) {
        console.log('Obscuring ' + this.grid[y][x].elem + ' at ' + y + ', ' + x + '...');
        this.grid[y][x].faceUp = false;
        console.log('*'.repeat(63));
        console.log('*'.repeat(25) + ' AFTER OBSCURING ' + '*'.repeat('25'));
        this.printState();
    }

    // scry - turn one card face up
    scry(y, x) {
        console.log('Scrying ' + this.grid[y][x].elem + ' at ' + y + ', ' + x + '...');
        this.grid[y][x].faceUp = true;
        console.log('*'.repeat(63));
        console.log('*'.repeat(25) + ' AFTER SCRYING ' + '*'.repeat('25'));
        this.printState();
    }

    // replace - send one card to discard and replace with one from deck
    replace(y, x) {
        console.log('Replacing ' + this.grid[y][x].elem + ' at ' + y + ', ' + x + '...');
        this.deck.discard.push(this.grid[y][x]);
        this.grid[y][x] = this.deck.topCard();
        if ((y == 1 || y == 2) && (x == 1 || x == 2)) {
            this.grid[y][x].faceUp = true;
        }
        console.log('*'.repeat(63));
        console.log('*'.repeat(25) + ' AFTER REPLACING ' + '*'.repeat('25'));
        console.log('*'.repeat(63));
        console.log('Cards in deck:' + this.deck.cards.length + ' || Cards in discard: ' + this.deck.discard.length);
        this.printState();
    }

    // print state of game to terminal in formatted ASCII
    // currently only prints element grid; ALLCAPS = face up
    printState() {
        let white = '            ';
        let printFormat = function (card) {
            let pstr = card.elem + white.slice(0, 12 - card.elem.length);
            if (card.faceUp == true) {
                pstr = pstr.toUpperCase();
            }
            return pstr;
        }

        console.log('*'.repeat(61));
        console.log('');
        console.log('xxxx       ' + printFormat(this.grid[0][0]) + printFormat(this.grid[0][1]) + printFormat(this.grid[0][2]) + printFormat(this.grid[0][3]) + 'xxxx');
        console.log('');
        console.log('xxxx       ' + printFormat(this.grid[1][0]) + printFormat(this.grid[1][1]) + printFormat(this.grid[1][2]) + printFormat(this.grid[1][3]) + 'xxxx');
        console.log('');
        console.log('xxxx       ' + printFormat(this.grid[2][0]) + printFormat(this.grid[2][1]) + printFormat(this.grid[2][2]) + printFormat(this.grid[2][3]) + 'xxxx');
        console.log('');
        console.log('xxxx       ' + printFormat(this.grid[3][0]) + printFormat(this.grid[3][1]) + printFormat(this.grid[3][2]) + printFormat(this.grid[3][3]) + 'xxxx');
        console.log('');
        console.log('*'.repeat(61));
        console.log(this.grid);
    }


}
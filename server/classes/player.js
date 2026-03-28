module.exports = class Player {
    constructor(id, socketid, name) {
        this.id = id;
        this.socketid = socketid;
        this.ready = false;
        this.name = name;
        this.spells = [];
        this.health = 5;
        this.shields = 0;
        this.adjustActions = 0;
        this.aptokens = 0;
        this.hptokens = 0;
        this.isGhost = false;
        this.passives = {overdrive: false, hypermetabolism: false, telepathy: false, brilliance: false}
    }

    // method(params) {}

    draw(deck){
        this.spells.push(deck.topCard()); // untested
    }

    discard(card, deck){
        let idx = this.spells.indexOf(card);
        if (idx !== -1) { this.spells.splice(idx, 1) }; // untested
        deck.discard.push(card);
    }

    /**
     * Process AP tokens at turn start. Returns history messages.
     */
    processApTokens() {
        let messages = [];
        if (this.aptokens > 0) {
            this.adjustActions++;
            this.aptokens--;
            if (this.aptokens > 0 && this.passives.overdrive) {
                this.adjustActions++;
                this.aptokens--;
                messages.push(this.name + ' consumes 2 haste tokens(Overdrive) and has been awarded 2 extra actions!');
            } else {
                messages.push(this.name + ' consumes 1 haste token and has been awarded an extra action!');
            }
        } else if (this.aptokens < 0) {
            this.adjustActions--;
            this.aptokens++;
            messages.push(this.name + '  is slowed by a slow token and loses the ability to divine!');
        }
        return messages;
    }

    /**
     * Process HP tokens at turn end. Returns { messages, tookDamage }.
     */
    processHpTokens() {
        let messages = [];
        let tookDamage = false;
        if (this.hptokens > 0) {
            let counter = 0;
            if (this.health < 5) {
                this.health++;
                counter++;
            }
            this.hptokens--;
            if (this.passives.hypermetabolism && this.hptokens > 0) {
                if (this.health < 5) {
                    this.health++;
                    counter++;
                }
                this.hptokens--;
                messages.push(this.name + ' consumed 2 Regen Tokens(Hypermetabolism) and heals for ' + counter + ' health');
            } else {
                messages.push(this.name + ' consumed 1 Regen Tokens and heals for ' + counter + ' health');
            }
        } else if (this.hptokens < 0) {
            if (this.shields > 0) {
                this.shields--;
            } else {
                this.health--;
                tookDamage = true;
            }
            this.hptokens++;
            messages.push(this.name + ' Burns for 1 damage');
        }
        return { messages, tookDamage };
    }

    reset(){
        this.spells = [];
        this.health = 5;
        this.shields = 0;
        this.adjustActions = 0;
        this.aptokens = 0;
        this.hptokens = 0;
        this.isGhost = false;
        this.ready = false;
        this.passives = {overdrive: false, hypermetabolism: false, telepathy: false, brilliance: false};
    }

}

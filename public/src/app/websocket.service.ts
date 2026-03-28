import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject, BehaviorSubject } from 'rxjs'; // rxjs/observable (Angular 4) doesn't work with Angular 6, so we just need to use rxjs

@Injectable({
  providedIn: 'root'
})


export class WebsocketService {
    state: any;
    playerid: string;
    enemies: any;
    counter  = 0;
    spell = null;
    effects = [];
    actor = null;
    cardsFaceUp = 0;
    cardsFaceDown = 0;

    _state: BehaviorSubject<any> = new BehaviorSubject(null);

    _gameState: BehaviorSubject<any> = new BehaviorSubject({'mode' : 'ready', 'value' : 1});

    private allPlayersSource = new Subject<any>();
    allPlayers$ = this.allPlayersSource.asObservable();

    private socket: SocketIOClient.Socket; // the client instance of socket.io

    constructor(private _http: HttpClient) {
        console.log('i built a websocket');
        this.socket = io();
        this.socket.on('connect', () => {
            this.playerid = this.socket.id;
            console.log('playerid');
            console.log(this.playerid);
        });

        this.socket.on('INIT', (state) => {
            // console.log('websocket.service says: state INIT');
            this._state.next(state);
            if (state) {
                this.getActor(state);
            }
        });

        this.socket.on('UPDATE', (state) => {
            // console.log('websocket.service says: state UPDATE');
            this._state.next(state);
            if (state) {
                this.cardCounterReset();
                this.getActor(state);
                this.cardCounters(state);
            }
        });

        this.socket.on('DIVINE_STEP_START', payload => {
            if (this.cardsFaceDown === 0) { //No cards to divine so skip
                this.doDivineStepEnd();
            } else if (payload.value > this.cardsFaceDown) { // less cards available to divine then divine step assigned, so swapping to the avaiable amount
                this.counter = this.cardsFaceDown;
                this._gameState.next({'mode' : 'divineStep' , 'value' : 4});
            } else { // else continue as normal
                this.counter = payload.value;
                this._gameState.next({'mode' : 'divineStep' , 'value' : 4});
            }
        });

        this.socket.on('ACTION_STEP_START', () => {
            this._gameState.next({'mode' : 'actionStepStart' , 'value' : 6});
        });

        this.socket.on('TARGET_PLAYER', (spellEffect) => {
            this.effects = spellEffect;
            this._gameState.next({'mode' : 'targetingPlayer' , 'value' : 13});
        });

        this.socket.on('TARGET_CARDS', (spellEffect) => {
            this.effects = spellEffect;
        });

        this.socket.on('TURN_FINISHED', () => {
            this._gameState.next({'mode' : 'ActionEnd' , 'value' : 8});
        });

        this.socket.on('CAST_END', () => {
            this.endActionStepCheck();
        });
    }

    getObservable() {
        return this._state.asObservable();
    }

    getGameState() {
        return this._gameState.asObservable();
    }

    getActor(state) {
        for (const person of state.players) {
            if (this.playerid === person.socketid) {
                this.actor = person;
                break;
            }
        }
    }

    getPlayer() {
        return this.actor;
    }

    cardCounters(state) {
        if (!state.gameboard || !state.gameboard.grid) { return; }
        for (const row of state.gameboard.grid) {
            for (const card of row) {
                if(card.faceUp) { this.cardsFaceUp++ };
                if(!card.faceUp) { this.cardsFaceDown++ };
            }
        }
    }

    cardCounterReset() {
        this.cardsFaceUp = 0;
        this.cardsFaceDown = 0;
    }

    addPlayer(name) {
        console.log('websocket.service says: addPlayer()');
        // this.socket.emit('addPlayer', {name: name});
        // this.socket.on('addedPlayer', function(data){
        // 	console.log(data)
        // 	this.allPlayersSource.next(data['players']);
        // }.bind(this));
   }

   turnStart() {
       this._gameState.next({'mode' : 'turnStart', 'value' : 3});
   }

   doAttack(target, value) {
       this.socket.emit('ATTACK', {actor: this.actor , target, value});
   }

   doAttackAll(value) {
       this.socket.emit('ATTACK_ALL', {actor : this.actor, value});
   }

    doCure(value) {
       this.socket.emit('CURE', {actor : this.actor, value});
    }

    doShield(value) {
       this.socket.emit('SHIELD', {actor : this.actor, value});
    }

    doHpPlus(value) {
       this.socket.emit('HP_PLUS', {actor : this.actor, value});
    }

    doHpMinus(target, value) {
       this.socket.emit('HP_MINUS', {actor : this.actor, target, value});
    }

    doApPlus(value) {
       this.socket.emit('AP_PLUS', {actor : this.actor, value});
    }

    doApMinus(target, value) {
        this.socket.emit('AP_MINUS', {actor : this.actor, target, value});
    }

    doDivine(value, yx) {
        this.socket.emit('DIVINE', {actor : this.actor, value, yx});
    }

    doDivineStep(value, yx) {
        this.socket.emit('DIVINE_STEP', {actor : this.actor, value, yx});
    }

    doWeave(yx1, yx2) {
        this.socket.emit('WEAVE', {actor : this.actor, yx1, yx2});
        // Further Effects?
        this.endActionStepCheck();
    }

    doObscure(value, yx) {
        this.socket.emit('OBSCURE', {actor : this.actor, value, yx});
        // Further Effects?
        this.endActionStepCheck();
    }

    doScry(value, yx) {
        this.socket.emit('SCRY', {actor : this.actor, value, yx});
        // Further Effects?
        this.endActionStepCheck();
    }

    doReady() {
        console.log('sending READY');
        this.socket.emit('READY', {actor : this.actor});
        this._gameState.next({'mode' : 'start', 'value' : 2});
    }
    doTurn() {
        console.log('starting TURN');
        this._gameState.next({'mode' : 'awaiting', 'value' : 99});
        this.socket.emit('TURN_ACK', {actor : this.actor});
    }
    doDivineStepEnd() {
        this.socket.emit('DIVINE_STEP_END');
        this._gameState.next({'mode' : 'divineStepEnd' , 'value' : 5});
    }
    doDivineEnd() {
        this.socket.emit('DIVINE_END', {actor : this.actor});
        // Further Effects?
        this.endActionStepCheck();
    }
    endTurn() {
        this.socket.emit('TURN_END', {actor : this.actor});
    }

    spellSuccess(discard, spell) {
        // replace used gameboard elements
        this.socket.emit('REPLACE_ELEMENTS', {actor : this.actor, cards: discard});
        // remove spell from player's hand
        this.socket.emit('CAST_SUCCESS', {actor : this.actor, spell});
        // save spell, spell effects, and actor for all spell effects;
        this.spell = spell;
        this.effects = spell.effects;

        // do first spell effect
        this.doSpellEffects();
    }

    spellFailure(discard, spell) {
        // replace used gameboard elements
        this.socket.emit('REPLACE_ELEMENTS', {actor : this.actor, cards: discard});
        // player to experience cast fail punishment
        this.socket.emit('CAST_FAIL', {actor : this.actor, spell});
        // this action is complete
        this._gameState.next({'mode' : 'ActionEnd' , 'value' : 8});
    }

    sendTarget(target) {
        if (this.effects.length === 0) {
            this.endActionStepCheck();
            return;
        }
        if(this.spell && this.spell.targeted) { // multiple cast for same target
            while(this.effects.length > 0 && this.effects[0].targetPlayer){
                this.socket.emit('CAST_EFFECT', {actor: this.actor, target, furtherEffects: [this.effects[0]]});
                this.effects.shift(); 
            }
        } else { // normal targeting
            this.socket.emit('CAST_EFFECT', {actor: this.actor, target, furtherEffects: [this.effects[0]]});
            this.effects.shift();
        }
        // Further Effects?
        this.endActionStepCheck();
    }

    actionDivine(num = 2) {
        if(this.cardsFaceDown === 0){ //No cards to divine so skip
            this.endActionStepCheck();
        } else if (num > this.cardsFaceDown){ // less cards available to divine then effect assigned, so swapping to the avaiable amount
            this.counter = this.cardsFaceDown;
            this._gameState.next({'mode' : 'divineAction', 'value' : 7});
        } else { // else continue as normal
            this.counter = num; 
            this._gameState.next({'mode' : 'divineAction', 'value' : 7});
        }
    }

    actionScry(num = 1) {
        if(this.cardsFaceDown === 0){ //No cards to scry so skip
            this.endActionStepCheck();
        } else if (num > this.cardsFaceDown){ // less cards available to scry then effect assigned, so swapping to the avaiable amount
            this.counter = this.cardsFaceDown;
            this._gameState.next({'mode' : 'scryAction', 'value' : 17});
        } else { // else continue as normal
            this.counter = num;
            this._gameState.next({'mode' : 'scryAction', 'value' : 17}); 
        }
    }

    actionObscure(num = 1) {
        if(this.cardsFaceUp === 0){ //No cards to obscure so skip
            this.endActionStepCheck();
        } else if (num > this.cardsFaceUp){ // less cards available to obscure then effect assigned, so swapping to the avaiable amount
            this.counter = this.cardsFaceUp;
            this._gameState.next({'mode' : 'obscureAction', 'value' : 18});
        } else { // else continue as normal
            this.counter = num;
            this._gameState.next({'mode' : 'obscureAction', 'value' : 18});
        }
    }

    actionWeave() {
        if(this.cardsFaceDown < 2){
            this.endActionStepCheck();
        } else{
            this.counter = 2;
            this._gameState.next({'mode' : 'weaveAction', 'value' : 15});
        }
    }

    actionCast() {
        this._gameState.next({'mode' : 'castAction', 'value' : 10});
    }

    reduceCounter() {
        this.counter--;
    }

    actionLearn() {
        this.socket.emit('LEARN', {actor : this.actor, draw: 4, keep: 2});
        this._gameState.next({'mode' : 'learnAction', 'value' : 16});
    }

    spellSelectFail() {
        this._gameState.next({'mode' : 'castAction', 'value' : 11});
    }

    spellElemSelect() {
        this._gameState.next({'mode' : 'spellElemSelect', 'value' : 12});
    }

    getCounter() {
        return this.counter;
    }

    setCounter(num) {
        this.counter = num;
    }

    learn(cardIndices) {
        this.socket.emit('LEARN_DISCARD', {actor : this.actor, cardIndices});
         this.endActionStepCheck();
    }

    // Execute next effect from spell
    doSpellEffects() {
        if (this.effects.length > 0) {
            if (this.effects[0].targetPlayer) {
                this._gameState.next({'mode' : 'targetingPlayer' , 'value' : 13});
            } else { // not targeted
                switch (this.effects[0].type) {
                    case 'DIVINE':
                        this.actionDivine(this.effects[0].value);
                        this.effects.shift();
                        break;
                    case 'WEAVE':
                        this.actionWeave();
                        this.effects.shift();
                        break;
                    case 'SCRY':
                        this.actionScry(this.effects[0].value);
                        this.effects.shift();
                        break;
                    case 'OBSCURE':
                        this.actionObscure(this.effects[0].value);
                        this.effects.shift();
                        break;
                    default:
                        this.socket.emit('CAST_EFFECT', {actor : this.actor, spell: this.spell, furtherEffects : [this.effects[0]]});
                        this.effects.shift();
                        this.endActionStepCheck();
                        break;
                }
            }
        }
    }

    enemyTargetFail() {
        this._gameState.next({'mode' : 'targetingPlayer', 'value' : 14});
    }

    getEffectsCount() {
        return this.effects.length;
    }

    endActionStepCheck() {
        if (this.effects.length > 0) {
            this.doSpellEffects();
        } else {
            this._gameState.next({'mode' : 'ActionEnd' , 'value' : 8});
            this.socket.emit('ACTION_STEP_END', {actor : this.actor});
        }
    }

    setAwait() {
        this._gameState.next({'mode' : 'awaiting' , 'value' : 99});
    }

    reset() {
        this.socket.emit('GAME_RESET', {actor: this.actor});
    }

  }

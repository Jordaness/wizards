const actions = require('./actions');
const Player = require('../classes/player');
const Gameboard = require('../classes/gameboard');
const Deck = require('../classes/deck');
const { findPlayerById, checkDeath, isGameOver, shuffle } = require('./helpers');
const combat = require('./handlers/combat');
const tokens = require('./handlers/tokens');
const cards = require('./handlers/cards');
const spells = require('./handlers/spells');

const initialState = {
    gameOn: false,
    gameOver: false,
    winner: null,
    players: [],
    currentTurn: null,
    nextPlayer: 1,
    gameboard: null,
    history: [],
    learnHelper: {keep: null, cardsDrawn: []},
    highlight: [],
}

function reducer(state = initialState, action){
    switch(action.type){



        case actions.GAME_SETUP: {
            console.log('reducers.js heard GAME_SETUP');
            let newState = Object.assign({}, state);
            let eDeck = new Deck();
            eDeck.initializeAsElementDeck();
            let sDeck = new Deck();
            sDeck.initializeAsSpellDeck();
            let gb = new Gameboard(eDeck, sDeck);
            console.log(gb);
            newState.gameboard = gb;
            newState.history.push(action.message);
            return newState;
        }


        case actions.READY: {
            console.log('reducers.js heard READY');
            let newState = Object.assign({}, state);
            let currentPlayer = findPlayerById(newState.players, action.actor.id);
            console.log('from '+currentPlayer.socketid);
            currentPlayer.ready = true;
            return newState;
        }


        case actions.GAME_START: {
            console.log('reducers.js heard GAME_START');
            let newState = Object.assign({}, state);
            // randomize player order
            shuffle(newState.players);
            // set state.currentTurn to 0 (first player)
            newState.currentTurn = 0;
            // set state.gameOn to true
            newState.gameOn = true;
            for(let pl of newState.players){
                for(let i=0; i<5; i++){
                    let drawnSpell = newState.gameboard.spellDeck.topCard();
                    if (drawnSpell) {
                        pl.spells.push(drawnSpell);
                    } else {
                        console.log('WARNING: Spell deck empty during initial deal for '+pl.name);
                        break;
                    }
                }
            };
            newState.history.push(action.message);
            return newState;
        }


        case actions.TURN_START: {
            console.log('reducers.js heard TURN_START');
            let newState = Object.assign({}, state);
            let currentPlayer = newState.players[newState.currentTurn];
            newState.history.push(currentPlayer.name + ' started their turn');
            // ap +- tokens
            let apMessages = currentPlayer.processApTokens();
            newState.history.push(...apMessages);
            // brilliance free spellcard awarded
            if (currentPlayer.passives.brilliance) {
                currentPlayer.spells.push(newState.gameboard.spellDeck.topCard());
                newState.history.push(currentPlayer.name + ' has earned a free spell card(Brillance)!');
            }
            return newState;
        }

        case actions.ATTACK:
            console.log('reducers.js heard ATTACK');
            return combat.handleAttack(state, action);

        case actions.ATTACK_ALL:
            console.log('reducers.js heard ATTACK_ALL');
            return combat.handleAttackAll(state, action);

        case actions.DRAIN:
            console.log('reducers.js heard DRAIN');
            return combat.handleDrain(state, action);

        case actions.CURE:
            console.log('reducers.js heard CURE');
            return combat.handleCure(state, action);

        case actions.SHIELD:
            console.log('reducers.js heard SHIELD');
            return combat.handleShield(state, action);

        case actions.HP_PLUS:
            console.log('reducers.js heard HP_PLUS');
            return tokens.handleHpPlus(state, action);

        case actions.HP_MINUS:
            console.log('reducers.js heard HP_MINUS');
            return tokens.handleHpMinus(state, action);

        case actions.AP_PLUS:
            console.log('reducers.js heard AP_PLUS');
            return tokens.handleApPlus(state, action);

        case actions.AP_MINUS:
            console.log('reducers.js heard AP_MINUS');
            return tokens.handleApMinus(state, action);

        case actions.DIVINE:
            console.log('reducers.js heard DIVINE');
            return cards.handleDivine(state, action);

        case actions.UNHIGHLIGHT:
            console.log('reducers.js heard UNHIGHLIGHT');
            return cards.handleUnhighlight(state, action);

        case actions.WEAVE:
            console.log('reducers.js heard WEAVE');
            return cards.handleWeave(state, action);

        case actions.SCRY:
            console.log('reducers.js heard SCRY');
            return cards.handleScry(state, action);

        case actions.OBSCURE:
            console.log('reducers.js heard OBSCURE');
            return cards.handleObscure(state, action);


        case actions.REFRESH:
            console.log('reducers.js heard REFRESH');
            console.log('... but the future refused to change.  (Action not yet implemented.)')
            // discard targeted card, replace from deck
            // show element of card to actor through socket
            // broadcast coordinates of card to all non-actors
            return state;


        case actions.LEARN:
            console.log('reducers.js heard LEARN');
            return spells.handleLearn(state, action);

        case actions.LEARN_DISCARD:
            console.log('reducers.js heard LEARN_DISCARD');
            return spells.handleLearnDiscard(state, action);

        case actions.EXHAUST:
            console.log('reducers.js heard EXHAUST');
            return spells.handleExhaust(state, action);

        case actions.PASSIVE:
            console.log('reducers.js heard PASSIVE');
            return spells.handlePassive(state, action);

        case actions.CAST_SUCCESS:
            console.log('reducers.js heard CAST_SUCCESS');
            return spells.handleCastSuccess(state, action);

        case actions.CAST_FAIL:
            console.log('reducers.js heard CAST_FAIL');
            return spells.handleCastFail(state, action);


        case actions.ADD_PLAYER:
            console.log('reducers.js heard ADD_PLAYER');
            let np = new Player(state.nextPlayer, action.socket, action.name);
            return Object.assign({}, state, {
                players: [
                    ... state.players,
                    np
                ], 
                nextPlayer: state.nextPlayer + 1,
                history: [... state.history, action.message]
            });


        case actions.REMOVE_PLAYER: {
            console.log('reducers.js heard REMOVE_PLAYER');
            let newState = Object.assign({}, state);
            let idx = newState.players.findIndex(p => p.id === action.player.id);
            if (idx === -1) {
                console.log('WARNING: Could not find player to remove');
                return state;
            }
            newState.players = newState.players.slice(0,idx).concat(newState.players.slice(idx+1));
            // adjust currentTurn if needed
            if (newState.currentTurn !== null && newState.players.length > 0) {
                if (idx < newState.currentTurn) {
                    newState.currentTurn--;
                } else if (idx === newState.currentTurn) {
                    newState.currentTurn = newState.currentTurn % newState.players.length;
                }
            }
            newState.history = [... state.history, action.message]
            return newState;
        }


        case actions.GAME_RESET: {
            console.log('reducers.js heard GAME_RESET');
            let newState = Object.assign({}, initialState, {
                history: [],
                learnHelper: {keep: null, cardsDrawn: []},
                highlight: [],
            });
            // reinitializing the gameboard
            let eleDeck = new Deck();
            eleDeck.initializeAsElementDeck();
            let splDeck = new Deck();
            splDeck.initializeAsSpellDeck();
            let gmb = new Gameboard(eleDeck, splDeck);
            newState.gameboard = gmb;
            // same players from previous game
            newState.players = state.players;
            // reset each player in the game
            for(let player of newState.players) {
                player.reset();
            }
            newState.nextPlayer = state.nextPlayer;
            newState.history = [... state.history, "Game has been reset!"];
            return newState;
        }

        
        case actions.GAME_END:
            return state;





        case actions.TURN_END: {
            console.log('reducers.js heard TURN_END');
            let newState = Object.assign({}, state);
            let currentPlayer = newState.players[newState.currentTurn];
            // hp +- tokens
            let hpResult = currentPlayer.processHpTokens();
            newState.history.push(...hpResult.messages);
            if (hpResult.tookDamage) {
                checkDeath(currentPlayer);
                isGameOver(newState);
                if (newState.gameOver) {
                    return newState;
                }
            }
            // advance state.currentTurn to next living player
            let nextTurn = (newState.currentTurn + 1) % newState.players.length;
            let loopGuard = 0;
            while(newState.players[nextTurn].isGhost && loopGuard < newState.players.length){
                nextTurn = (nextTurn + 1) % newState.players.length;
                loopGuard++;
            }
            newState.currentTurn = nextTurn;
            newState.history.push(currentPlayer.name+ ' has ended their turn.');
            return newState;
        }

        case actions.DIVINE_STEP_START:
            return state;


        case actions.DIVINE_STEP_END:
            return state;


        case actions.ACTION_STEP_START:
            return state;


        case actions.ACTION_STEP_END:
            return state;


        case actions.RESET_ADJUST: {
            console.log('reducers.js heard RESET_ADJUST');
            let newState = Object.assign({}, state);
            let currentPlayer = findPlayerById(newState.players, action.actor.id);
            if (currentPlayer.adjustActions > 0) {
                currentPlayer.adjustActions--;    
            } else {
                currentPlayer.adjustActions = 0;
            }
            return newState;
        }


        case actions.REPLACE_ELEMENTS:
            console.log('reducers.js heard REPLACE_ELEMENTS');
            return cards.handleReplaceElements(state, action);

        default:
            console.log('reducers.js is confused!')
            console.log('It defaulted itself in its confusion.')
            return state;
    }
}


const gameApp = reducer;


module.exports = { gameApp }

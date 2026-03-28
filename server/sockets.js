const gameStore = require('./redux/store');
const actions = require('./redux/actions');
const validate = require('./validate');
const allSpells = require('./allspells');

const cloner = require('cloner');

let currentPlayer = null;
let wizardNames = [
    'Merlin', 'Caramon', 'Raistlin', 'Rincewind', 'Ridcully', 'Elminster', 'Mordenkainen', 'Bigby', 'Drawmij', 'Leomund', 'Melf', 'Nystul', 'Tenser', 'Evard', 'Otiluke', 'Grimskull', 'Harlequin', 'Morgana', 'Maleficent', 'Gandalf', 'Glinda', 'Harry Dresden', 'Molly Carpenter', "Rand al'Thor", 'Tim', 'Cassandra', 'Hecate', 'Skald', 'Medea', 'Circe', 'Blaise', 'Ganondorf', 'Prospero', 'Maeve', 'Mab', 'Titania', 'Aurora', 'Ursula', 'Sabrina', 'Gruntilda', 'Granny Weatherwax', 'Nanny Ogg', 'Magrat Garlick', 'Mirri Maz Duur', 'Erszebet Karpaty', 'Iris', 'Melisandre', 'Sycorax', 'Jafar', 'Belgarath', 'Iskandar Khayon'
];
let wizName = null;
let wizIndex = null;

module.exports = function(io){

    function validateAction(payload, socket, opts = {}) {
        const state = gameStore.getState();
        if (!validate.isActorLegit(payload, socket, state)) return null;
        if (opts.requireTurn && !validate.isCurrentTurnPlayer(socket, state)) return null;
        if (opts.safeValue && !validate.isSafeValue(payload.value, opts.safeValue[0], opts.safeValue[1])) return null;
        if (opts.requireTarget) {
            if (!validate.isValidTarget(payload.target, state)) return null;
            if (!validate.isPlayerAlive(payload.target, state)) return null;
        }
        if (opts.safeCoords && !validate.areSafeCoords(opts.safeCoords === true ? payload.yx : opts.safeCoords)) return null;
        return state;
    }

    function update(){
        console.log('sockets.js says: emitting UPDATE');
        io.emit('UPDATE', gameStore.getState());
        console.log(gameStore.getState());
    }

    function actOrDont(actor, socket){
        console.log('sockets.js says: checking actOrDont');
        if(actor.adjustActions > 0){
            console.log('sockets.js says: extra action!');
            gameStore.dispatch(actions.resetAdjust(actor));
            update();
            socket.emit('ACTION_STEP_START');
        } else {
            console.log('sockets.js says: moving on');
            gameStore.dispatch(actions.resetAdjust(actor));
            update();
            socket.emit('TURN_FINISHED');
        }
    }

    io.on('connection', (socket) => {

        // connect and disconnect

        console.log('new connection made');
        wizIndex = Math.floor(Math.random()*wizardNames.length);
        wizName = wizardNames[wizIndex];
        wizardNames = wizardNames.slice(0,wizIndex).concat(wizardNames.slice(wizIndex+1));
        gameStore.dispatch(actions.addPlayer(socket.id, wizName));
        console.log(gameStore.getState());
        console.log('emitting INIT / UPDATE');
        socket.emit('INIT', gameStore.getState());
        socket.broadcast.emit('UPDATE', gameStore.getState());

        socket.on('disconnect', function(){
            let theState = gameStore.getState();
            let leaver = theState.players.find((player)=>{
                return player.socketid == socket.id;
            });
            console.log('sockets.js says: '+leaver.name+' disconnected');
            gameStore.dispatch(actions.removePlayer(leaver));
            update();
        });



        // ready and game start

        socket.on(actions.READY, (payload)=>{
            console.log('sockets.js says: heard READY');
            console.log(payload);
            const state = gameStore.getState();
            if (!validate.isActorLegit(payload, socket, state)) return;
            if (state.gameOn) {
                console.log('sockets.js says: game already started, ignoring READY');
                return;
            }
            gameStore.dispatch(actions.ready(payload.actor));
            let readyState = gameStore.getState();
            let allReady = readyState.players.reduce((acc, flag)=>{
                return (acc && flag.ready);
            }, true);
            update();
            if (allReady && readyState.players.length >= 2){
                io.emit('GAME_STARTED');
                gameStore.dispatch(actions.gameStart());
                update();
                io.emit('TURN_START');
            }
        });



        // hear TURN_ACK, dispatch TURN_START, respond either DIVINE_STEP_START or ACTION_STEP_START

        socket.on(actions.TURN_ACK, (payload)=>{
            console.log('sockets.js says: heard TURN_ACK');
            const state = gameStore.getState();
            if (!validate.isActorLegit(payload, socket, state)) return;
            currentPlayer = state.players.find((player)=>{
                return player.id == payload.actor.id;
            })
            // if current player is dead, skip their turn
            if(currentPlayer.isGhost){
                console.log('sockets.js says: player is a ghost, skipping turn');
                gameStore.dispatch(actions.turnEnd());
                update();
                io.emit('TURN_START');
                return;
            }
            gameStore.dispatch(actions.turnStart());
            update();
            currentPlayer = gameStore.getState().players.find((player)=>{
                return player.id == payload.actor.id;
            })
            if(!currentPlayer.isGhost && currentPlayer.adjustActions < 0){
                socket.emit('ACTION_STEP_START');
            } else {
                let divinePayload = 2;
                if(currentPlayer.passives.telepathy){
                    divinePayload = 3;
                }
                socket.emit('DIVINE_STEP_START', {value: divinePayload});
            }
        });



        // accept DIVINE_STEP, dispatch DIVINE

        socket.on(actions.DIVINE_STEP, (payload)=>{
            console.log('sockets.js says: heard DIVINE_STEP');
            const state = validateAction(payload, socket, {requireTurn: true, safeCoords: payload.yx});
            if (!state) return;
            const actingPlayer = state.players[state.currentTurn];
            const allowedDivineCount = actingPlayer.passives.telepathy ? 3 : 2;
            if (payload.yx.length > allowedDivineCount) return;
            for (const c of payload.yx) {
                if (state.gameboard.grid[c[0]][c[1]].faceUp === true) return;
            }
            gameStore.dispatch(actions.divine(payload.actor, payload.value, payload.yx))
            // regular state with HIGHLIGHT data
            socket.broadcast.emit('UPDATE', gameStore.getState());
            // super secret state with divined cards faceUp = true
            let ephemeral = cloner.deep.copy(gameStore.getState());
            for (const c of payload.yx){
                ephemeral.gameboard.grid[c[0]][c[1]].faceUp = true;
            }
            socket.emit('UPDATE', ephemeral);
        });


        // accept DIVINE_STEP_END, respond ACTION_STEP_START

        socket.on(actions.DIVINE_STEP_END, ()=>{
            console.log('sockets.js says: heard DIVINE_STEP_END');
            if (!validate.isCurrentTurnPlayer(socket, gameStore.getState())) return;
            gameStore.dispatch(actions.unhighlight());
            update();
            socket.emit('ACTION_STEP_START');
        });




        //
        //
        // action funtimes happen here!
        //
        //




        // accept ACTION_STEP_END, loop back or move on\

        socket.on(actions.ACTION_STEP_END, (payload)=>{
            console.log('sockets.js says: heard ACTION_STEP_END');
            if (!validateAction(payload, socket, {requireTurn: true})) return;
            actOrDont(payload.actor, socket);
        });



        // accept TURN_END, advance turn

        socket.on(actions.TURN_END, (payload)=>{
            console.log('sockets.js says: heard TURN_END');
            if (!validateAction(payload, socket, {requireTurn: true})) return;
            gameStore.dispatch(actions.turnEnd());
            update();
            io.emit('TURN_START');
        });




        socket.on(actions.REPLACE_ELEMENTS, (payload)=>{
            if (!validateAction(payload, socket, {requireTurn: true, safeCoords: payload.cards})) return;
            gameStore.dispatch(actions.replaceElements(payload.actor, payload.cards));
            update();
        });



        function endSpell(socket){
            update();
            socket.emit('CAST_END');
        }

        socket.on(actions.CAST_SUCCESS, (payload)=>{
            console.log('sockets.js says: heard CAST_SUCCESS: '+payload.spell.name);
            const state = validateAction(payload, socket, {requireTurn: true});
            if (!state) return;
            if (!validate.playerOwnsSpell(payload.actor, payload.spell.name, state)) return;
            gameStore.dispatch(actions.castSuccess(payload.actor, payload.spell));
            update();
        });


        socket.on(actions.CAST_EFFECT, (payload)=>{
            console.log('sockets.js says: heard CAST_EFFECT');
            const state = validateAction(payload, socket, {requireTurn: true});
            if (!state) return;
            if (!payload.spell || !payload.spell.name) {
                console.log('sockets.js says: CAST_EFFECT missing spell data');
                return;
            }

            // Look up effects from authoritative source — ignore payload.furtherEffects
            const spellDef = allSpells.find(s => s.name === payload.spell.name);
            if (!spellDef) return;

            for (const fx of spellDef.effects) {
                console.log('case '+fx.type);
                let currentState = gameStore.getState();

                // If game ended mid-spell, stop processing further effects
                if (currentState.gameOver) break;

                switch(fx.type){

                    case actions.ATTACK:
                        if (!validate.isValidTarget(payload.target, currentState)) break;
                        if (!validate.isPlayerAlive(payload.target, currentState)) break;
                        gameStore.dispatch(actions.attack(payload.actor, payload.target, fx.value));
                        break;

                    case actions.ATTACK_ALL:
                        gameStore.dispatch(actions.attackAll(payload.actor, fx.value));
                        break;

                    case actions.DRAIN:
                        if (!validate.isValidTarget(payload.target, currentState)) break;
                        if (!validate.isPlayerAlive(payload.target, currentState)) break;
                        gameStore.dispatch(actions.drain(payload.actor, payload.target, fx.value));
                        break;

                    case actions.CURE:
                        gameStore.dispatch(actions.cure(payload.actor, fx.value));
                        break;

                    case actions.SHIELD:
                        gameStore.dispatch(actions.shield(payload.actor, fx.value));
                        break;

                    case actions.AP_PLUS:
                        gameStore.dispatch(actions.apPlus(payload.actor, fx.value));
                        break;

                    case actions.AP_MINUS:
                        if (fx.targetPlayer && !validate.isPlayerAlive(payload.target, currentState)) break;
                        gameStore.dispatch(actions.apMinus(payload.actor, payload.target, fx.value, fx.targetPlayer, fx.limited));
                        break;

                    case actions.HP_PLUS:
                        gameStore.dispatch(actions.hpPlus(payload.actor, fx.value));
                        break;

                    case actions.HP_MINUS:
                        if (fx.targetPlayer && !validate.isPlayerAlive(payload.target, currentState)) break;
                        gameStore.dispatch(actions.hpMinus(payload.actor, payload.target, fx.value, fx.targetPlayer, fx.limited, fx.magnitize));
                        break;

                    case actions.OBSCURE:
                        if (!validate.areSafeCoords(payload.yx)) break;
                        if (payload.yx.length > fx.value) break;
                        gameStore.dispatch(actions.obscure(payload.actor, fx.value, payload.yx));
                        break;

                    case actions.PASSIVE:
                        gameStore.dispatch(actions.passive(payload.actor, fx.value));
                        break;

                    case actions.DIVINE:
                        socket.emit('DIVINE_STEP_START', { value: fx.value });
                        break;

                }
            }
            update();
        });


        socket.on(actions.CAST_FAIL, (payload)=>{
            console.log('sockets.js says: heard CAST_FAIL: '+payload.spell.name);
            const state = validateAction(payload, socket, {requireTurn: true});
            if (!state) return;
            if (!validate.playerOwnsSpell(payload.actor, payload.spell.name, state)) return;
            gameStore.dispatch(actions.castFail(payload.actor, payload.spell));
            endSpell(socket);
            // send some kinda event
        });


        



        // more stuff!

        socket.on(actions.ATTACK, (payload)=>{
            console.log('sockets.js says: heard ATTACK');
            if (!validateAction(payload, socket, {requireTurn: true, safeValue: [1, 10], requireTarget: true})) return;
            gameStore.dispatch(actions.attack(payload.actor, payload.target, payload.value));
            update();
        });

        socket.on(actions.ATTACK_ALL, (payload)=>{
            console.log('sockets.js says: heard ATTACK_ALL');
            if (!validateAction(payload, socket, {requireTurn: true, safeValue: [1, 10]})) return;
            gameStore.dispatch(actions.attackAll(payload.actor, payload.value));
            update();
        })

        socket.on(actions.CURE, (payload)=>{
            console.log('sockets.js says: heard CURE');
            if (!validateAction(payload, socket, {requireTurn: true, safeValue: [1, 10]})) return;
            gameStore.dispatch(actions.cure(payload.actor, payload.value));
            update();
        });

        socket.on(actions.SHIELD, (payload)=>{
            console.log('sockets.js says: heard SHIELD');
            if (!validateAction(payload, socket, {requireTurn: true, safeValue: [1, 10]})) return;
            gameStore.dispatch(actions.shield(payload.actor, payload.value));
            update();
        });

        socket.on(actions.HP_PLUS, (payload)=>{
            console.log('sockets.js says: heard HP_PLUS');
            if (!validateAction(payload, socket, {requireTurn: true, safeValue: [1, 10]})) return;
            gameStore.dispatch(actions.hpPlus(payload.actor, payload.value));
            update();
        });

        socket.on(actions.HP_MINUS, (payload)=>{
            console.log('sockets.js says: heard HP_MINUS');
            if (!validateAction(payload, socket, {requireTurn: true, safeValue: [1, 10], requireTarget: true})) return;
            gameStore.dispatch(actions.hpMinus(payload.actor, payload.target, payload.value));
            update();
        });

        socket.on(actions.AP_PLUS, (payload)=>{
            console.log('sockets.js says: heard AP_PLUS');
            if (!validateAction(payload, socket, {requireTurn: true, safeValue: [1, 10]})) return;
            gameStore.dispatch(actions.apPlus(payload.actor, payload.value));
            update();
        });

        socket.on(actions.AP_MINUS, (payload)=>{
            console.log('sockets.js says: heard AP_MINUS');
            if (!validateAction(payload, socket, {requireTurn: true, safeValue: [1, 10], requireTarget: true})) return;
            gameStore.dispatch(actions.apMinus(payload.actor, payload.target, payload.value));
            update();
        });

        // card stuff

        socket.on(actions.DIVINE, (payload)=>{
            console.log('sockets.js says: heard DIVINE');
            const state = validateAction(payload, socket, {requireTurn: true, safeCoords: payload.yx});
            if (!state) return;
            const actingPlayer = state.players[state.currentTurn];
            const allowedDivineCount = actingPlayer.passives.telepathy ? 3 : 2;
            if (payload.yx.length > allowedDivineCount) return;
            for (const c of payload.yx) {
                if (state.gameboard.grid[c[0]][c[1]].faceUp === true) return;
            }
            gameStore.dispatch(actions.divine(payload.actor, payload.value, payload.yx))
            // regular state with HIGHLIGHT data
            socket.broadcast.emit('UPDATE', gameStore.getState());
            // super secret state with divined cards faceUp = true
            let ephemeral = cloner.deep.copy(gameStore.getState());
            for (const c of payload.yx){
                ephemeral.gameboard.grid[c[0]][c[1]].faceUp = true;
            }
            socket.emit('UPDATE', ephemeral);
        });

        socket.on(actions.DIVINE_END, (payload)=>{
            console.log('sockets.js says: heard DIVINE_END');
            if (!validateAction(payload, socket, {requireTurn: true})) return;
            gameStore.dispatch(actions.unhighlight());
            update();
        });

        socket.on(actions.UNHIGHLIGHT, ()=>{
            console.log('sockets.js says: heard UNHIGHLIGHT');
            if (!validate.isCurrentTurnPlayer(socket, gameStore.getState())) return;
            gameStore.dispatch(actions.unhighlight());
            update();
        });

        socket.on(actions.WEAVE, (payload)=>{
            console.log('sockets.js says: heard WEAVE');
            if (!validateAction(payload, socket, {requireTurn: true})) return;
            if (!validate.areSafeCoords([payload.yx1])) return;
            if (!validate.areSafeCoords([payload.yx2])) return;
            gameStore.dispatch(actions.weave(payload.actor, payload.yx1, payload.yx2));
            update();
            socket.broadcast.emit('HIGHLIGHT', {type: 'WEAVE', coords: [payload.yx1, payload.yx2]});
            setTimeout(() => {
                gameStore.dispatch(actions.unhighlight());
                update();
            }, 3000);
        });

        socket.on(actions.OBSCURE, (payload)=>{
            console.log('sockets.js says: heard OBSCURE');
            if (!validateAction(payload, socket, {requireTurn: true, safeCoords: payload.yx})) return;
            gameStore.dispatch(actions.obscure(payload.actor, payload.value, payload.yx));
            update();
            socket.broadcast.emit('HIGHLIGHT', {type: 'OBSCURE', coords: payload.yx});
        });

        socket.on(actions.SCRY, (payload)=>{
            console.log('sockets.js says: heard SCRY');
            if (!validateAction(payload, socket, {requireTurn: true, safeCoords: payload.yx})) return;
            gameStore.dispatch(actions.scry(payload.actor, payload.value, payload.yx));
            update();
            socket.broadcast.emit('HIGHLIGHT', {type: 'SCRY', coords: payload.yx});
        });


        // refresh, learn, etc

        socket.on(actions.LEARN, (payload)=>{
            console.log('sockets.js says: heard LEARN');
            if (!validateAction(payload, socket, {requireTurn: true})) return;
            gameStore.dispatch(actions.learn(payload.actor, payload.draw, payload.keep));
            update();
        });


        socket.on(actions.LEARN_DISCARD, (payload)=>{
            console.log('sockets.js says: heard LEARN_DISCARD');
            if (!validateAction(payload, socket, {requireTurn: true})) return;
            gameStore.dispatch(actions.learnDiscard(payload.actor, payload.cardIndices));
            update();
        });

        // reset the game
        socket.on(actions.GAME_RESET, (payload)=>{
            console.log('sockets.js says: heard GAME_RESET');
            const state = gameStore.getState();
            if (!validate.isActorLegit(payload, socket, state)) return;
            if (!state.gameOver && state.gameOn) {
                console.log('sockets.js says: game is still in progress, ignoring GAME_RESET');
                return;
            }
            gameStore.dispatch(actions.gameReset());
            io.emit('GAME_STARTED');
            gameStore.dispatch(actions.gameStart());
            update();
            io.emit('TURN_START');
        })
    

        
    });


}

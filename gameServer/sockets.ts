const gameStore = require('./redux/store');
const actions = require('./redux/actions');

const cloner = require('cloner');

let currentPlayer = null;
let wizardNames = [
    'Merlin', 'Caramon', 'Raistlin', 'Rincewind', 'Ridcully', 'Elminster', 'Mordenkainen', 'Bigby', 'Drawmij', 'Leomund', 'Melf', 'Nystul', 'Tenser', 'Evard', 'Otiluke', 'Grimskull', 'Harlequin', 'Morgana', 'Maleficent', 'Gandalf', 'Glinda', 'Harry Dresden', 'Molly Carpenter', "Rand al'Thor", 'Tim', 'Cassandra', 'Hecate', 'Skald', 'Medea', 'Circe', 'Blaise', 'Ganondorf', 'Prospero', 'Maeve', 'Mab', 'Titania', 'Aurora', 'Ursula', 'Sabrina', 'Gruntilda', 'Granny Weatherwax', 'Nanny Ogg', 'Magrat Garlick', 'Mirri Maz Duur', 'Erszebet Karpaty', 'Iris', 'Melisandre', 'Sycorax', 'Jafar', 'Belgarath', 'Iskandar Khayon'
];
let wizName = null;
let wizIndex = null;

module.exports = function (io) {

    function update() {
        console.log('sockets.js says: emitting UPDATE');
        io.emit('UPDATE', gameStore.getState());
        console.log(gameStore.getState());
    }

    function actOrDont(actor, socket) {
        console.log('sockets.js says: checking actOrDont');
        if (actor.adjustActions > 0) {
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
        wizIndex = Math.floor(Math.random() * wizardNames.length);
        wizName = wizardNames[wizIndex];
        wizardNames = wizardNames.slice(0, wizIndex).concat(wizardNames.slice(wizIndex + 1));
        gameStore.dispatch(actions.addPlayer(socket.id, wizName));
        console.log(gameStore.getState());
        console.log('emitting INIT / UPDATE');
        socket.emit('INIT', gameStore.getState());
        socket.broadcast.emit('UPDATE', gameStore.getState());

        socket.on('disconnect', function () {
            let theState = gameStore.getState();
            let leaver = theState.players.find((player) => {
                return player.socketid == socket.id;
            });
            console.log('sockets.js says: ' + leaver.name + ' disconnected');
            gameStore.dispatch(actions.removePlayer(leaver));
            update();
        });



        // ready and game start

        socket.on(actions.READY, (payload) => {
            console.log('sockets.js says: heard READY');
            console.log(payload);
            gameStore.dispatch(actions.ready(payload.actor));
            let readyState = gameStore.getState();
            let allReady = readyState.players.reduce((acc, flag) => {
                return (acc && flag.ready);
            }, true);
            update();
            if (allReady) {
                io.emit('GAME_STARTED');
                gameStore.dispatch(actions.gameStart());
                update();
                io.emit('TURN_START');
            }
        });



        // hear TURN_ACK, dispatch TURN_START, respond either DIVINE_STEP_START or ACTION_STEP_START

        socket.on(actions.TURN_ACK, (payload) => {
            console.log('sockets.js says: heard TURN_ACK');
            currentPlayer = gameStore.getState().players.find((player) => {
                return player.id == payload.actor.id;
            })
            // if current player is dead, go for ghost mode!
            if (currentPlayer.health <= 0) {
                // ghost mode init event   
            }
            gameStore.dispatch(actions.turnStart());
            update();
            currentPlayer = gameStore.getState().players.find((player) => {
                return player.id == payload.actor.id;
            })
            if (!currentPlayer.isGhost && currentPlayer.adjustActions < 0) {
                socket.emit('ACTION_STEP_START');
            } else {
                let divinePayload = 2;
                if (currentPlayer.passives.telepathy) {
                    divinePayload = 3;
                }
                socket.emit('DIVINE_STEP_START', { value: divinePayload });
            }
        });



        // accept DIVINE_STEP, dispatch DIVINE

        socket.on(actions.DIVINE_STEP, (payload) => {
            console.log('sockets.js says: heard DIVINE_STEP');
            gameStore.dispatch(actions.divine(payload.actor, payload.value, payload.yx))
            // regular state with HIGHLIGHT data
            socket.broadcast.emit('UPDATE', gameStore.getState());
            // super secret state with divined cards faceUp = true
            let ephemeral = cloner.deep.copy(gameStore.getState());
            for (c of payload.yx) {
                ephemeral.gameboard.grid[c[0]][c[1]].faceUp = true;
            }
            socket.emit('UPDATE', ephemeral);
        });


        // accept DIVINE_STEP_END, respond ACTION_STEP_START

        socket.on(actions.DIVINE_STEP_END, () => {
            console.log('sockets.js says: heard DIVINE_STEP_END');
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

        socket.on(actions.ACTION_STEP_END, (payload) => {
            console.log('sockets.js says: heard ACTION_STEP_END');
            actOrDont(payload.actor, socket);
        });



        // accept TURN_END, advance turn

        socket.on(actions.TURN_END, (payload) => {
            console.log('sockets.js says: heard TURN_END');
            gameStore.dispatch(actions.turnEnd());
            update();
            io.emit('TURN_START');
        });




        socket.on(actions.REPLACE_ELEMENTS, (payload) => {
            gameStore.dispatch(actions.replaceElements(payload.actor, payload.cards));
            update();
        });



        function endSpell(socket) {
            update();
            socket.emit('CAST_END');
        }

        socket.on(actions.CAST_SUCCESS, (payload) => {
            console.log('sockets.js says: heard CAST_SUCCESS: ' + payload.spell.name);
            gameStore.dispatch(actions.castSuccess(payload.actor, payload.spell));
            update();
        });


        socket.on(actions.CAST_EFFECT, (payload) => {
            console.log('sockets.js says: heard CAST_EFFECT');
            // handle payload.furtherEffects
            console.log(payload.furtherEffects);
            for (let fx in payload.furtherEffects) {
                console.log(payload.furtherEffects[fx]);
                switch (payload.furtherEffects[fx].type) {

                    case actions.ATTACK:
                        console.log('case ATTACK');
                        gameStore.dispatch(actions.attack(payload.actor, payload.target, payload.furtherEffects[fx].value));
                        break;

                    case actions.ATTACK_ALL:
                        console.log('case ATTACK_ALL');
                        gameStore.dispatch(actions.attackAll(payload.actor, payload.furtherEffects[fx].value));
                        break;

                    case actions.DRAIN:
                        console.log('case DRAIN');
                        gameStore.dispatch(actions.drain(payload.actor, payload.target, payload.furtherEffects[fx].value));
                        break;

                    case actions.CURE:
                        console.log('case CURE');
                        gameStore.dispatch(actions.cure(payload.actor, payload.furtherEffects[fx].value));
                        break;

                    case actions.SHIELD:
                        console.log('case SHIELD');
                        gameStore.dispatch(actions.shield(payload.actor, payload.furtherEffects[fx].value));
                        break;

                    case actions.AP_PLUS:
                        console.log('case AP_PLUS');
                        gameStore.dispatch(actions.apPlus(payload.actor, payload.furtherEffects[fx].value));
                        break;

                    case actions.AP_MINUS:
                        console.log('case AP_MINUS');
                        gameStore.dispatch(actions.apMinus(payload.actor, payload.target, payload.furtherEffects[fx].value, payload.furtherEffects[fx].targetPlayer, payload.furtherEffects[fx].limited));
                        break;

                    case actions.HP_PLUS:
                        console.log('case HP_PLUS');
                        gameStore.dispatch(actions.hpPlus(payload.actor, payload.furtherEffects[fx].value));
                        break;

                    case actions.HP_MINUS:
                        console.log('case HP_MINUS');
                        gameStore.dispatch(actions.hpMinus(payload.actor, payload.target, payload.furtherEffects[fx].value, payload.furtherEffects[fx].targetPlayer, payload.furtherEffects[fx].limited, payload.furtherEffects[fx].magnitize));
                        break;

                    case actions.OBSCURE:
                        console.log('case OBSCURE');
                        gameStore.dispatch(actions.obscure(payload.actor, payload.yx));
                        break;

                    case actions.PASSIVE:
                        console.log('case PASSIVE');
                        gameStore.dispatch(actions.passive(payload.actor, payload.furtherEffects[fx].value));
                        break;

                    // more things

                }
            }
            update();


            // THIS IS CRAP, DON'T ACTUALLY USE THIS
            // if(spell.effects[0].targetPlayer == true){
            //     // remove first effect, send TARGET_PLAYER
            //     let furtherEffects = spell.effects.slice(1);
            //     socket.emit('TARGET_PLAYER', {furtherEffects})
            // } else if (spell.effects[0].targetCards == true){
            //     // remove first effect, send TARGET_CARDS
            //     let effectValue = spell.effects[0].value;
            //     let furtherEffects = spell.effects.slice(1);
            //     socket.emit('TARGET_CARDS', {furtherEffects, value: effectValue});
        });


        socket.on(actions.CAST_FAIL, (payload) => {
            console.log('sockets.js says: heard CAST_FAIL: ' + payload.spell.name);
            gameStore.dispatch(actions.castFail(payload.actor, payload.spell));
            endSpell(socket);
            // send some kinda event
        });






        // more stuff!

        socket.on(actions.ATTACK, (payload) => {
            console.log('sockets.js says: heard ATTACK');
            gameStore.dispatch(actions.attack(payload.actor, payload.target, payload.value));
            update();
        });

        socket.on(actions.ATTACK_ALL, (payload) => {
            console.log('sockets.js says: heard ATTACK_ALL');
            gameStore.dispatch(actions.attackAll(payload.actor, payload.value));
            update();
        })

        socket.on(actions.CURE, (payload) => {
            console.log('sockets.js says: heard CURE');
            gameStore.dispatch(actions.cure(payload.actor, payload.value));
            update();
        });

        socket.on(actions.SHIELD, (payload) => {
            console.log('sockets.js says: heard SHIELD');
            gameStore.dispatch(actions.shield(payload.actor, payload.value));
            update();
        });

        socket.on(actions.HP_PLUS, (payload) => {
            console.log('sockets.js says: heard HP_PLUS');
            gameStore.dispatch(actions.hpPlus(payload.actor, payload.value));
            update();
        });

        socket.on(actions.HP_MINUS, (payload) => {
            console.log('sockets.js says: heard HP_MINUS');
            gameStore.dispatch(actions.hpMinus(payload.actor, payload.target, payload.value));
            update();
        });

        socket.on(actions.AP_PLUS, (payload) => {
            console.log('sockets.js says: heard AP_PLUS');
            gameStore.dispatch(actions.apPlus(payload.actor, payload.value));
            update();
        });

        socket.on(actions.AP_MINUS, (payload) => {
            console.log('sockets.js says: heard AP_MINUS');
            gameStore.dispatch(actions.apMinus(payload.actor, payload.target, payload.value));
            update();
        });

        // card stuff

        socket.on(actions.DIVINE, (payload) => {
            console.log('sockets.js says: heard DIVINE');
            gameStore.dispatch(actions.divine(payload.actor, payload.value, payload.yx))
            // regular state with HIGHLIGHT data
            socket.broadcast.emit('UPDATE', gameStore.getState());
            // super secret state with divined cards faceUp = true
            let ephemeral = cloner.deep.copy(gameStore.getState());
            for (c of payload.yx) {
                ephemeral.gameboard.grid[c[0]][c[1]].faceUp = true;
            }
            socket.emit('UPDATE', ephemeral);
        });

        socket.on(actions.DIVINE_END, (payload) => {
            console.log('sockets.js says: heard DIVINE_END');
            gameStore.dispatch(actions.unhighlight());
            update();
        });

        socket.on(actions.UNHIGHLIGHT, () => {
            console.log('sockets.js says: heard UNHIGHLIGHT');
            gameStore.dispatch(actions.unhighlight());
            update();
        });

        socket.on(actions.WEAVE, (payload) => {
            console.log('sockets.js says: heard WEAVE');
            gameStore.dispatch(actions.weave(payload.actor, payload.yx1, payload.yx2));
            update();
            socket.broadcast.emit('HIGHLIGHT', { type: 'WEAVE', coords: [payload.yx1, payload.yx2] });
            setTimeout(() => {
                gameStore.dispatch(actions.unhighlight());
                update();
            }, 3000);
        });

        socket.on(actions.OBSCURE, (payload) => {
            console.log('sockets.js says: heard OBSCURE');
            gameStore.dispatch(actions.obscure(payload.actor, payload.value, payload.yx));
            update();
            socket.broadcast.emit('HIGHLIGHT', { type: 'OBSCURE', coords: payload.yx });
        });

        socket.on(actions.SCRY, (payload) => {
            console.log('sockets.js says: heard SCRY');
            gameStore.dispatch(actions.scry(payload.actor, payload.value, payload.yx));
            update();
            socket.broadcast.emit('HIGHLIGHT', { type: 'SCRY', coords: payload.yx });
        });


        // refresh, learn, etc

        socket.on(actions.LEARN, (payload) => {
            console.log('sockets.js says: heard LEARN');
            gameStore.dispatch(actions.learn(payload.actor, payload.draw, payload.keep));
            update();
        });


        socket.on(actions.LEARN_DISCARD, (payload) => {
            console.log('sockets.js says: heard LEARN_DISCARD');
            gameStore.dispatch(actions.learnDiscard(payload.actor, payload.cardIndices));
            update();
        });

        // reset the game
        socket.on(actions.GAME_RESET, (payload) => {
            console.log('sockets.js says: heard GAME_RESET');
            gameStore.dispatch(actions.gameReset());
            io.emit('GAME_STARTED');
            gameStore.dispatch(actions.gameStart());
            update();
            io.emit('TURN_START');
        })



    });


}
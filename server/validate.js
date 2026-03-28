// Server-side validation helpers for socket event handlers.
// All functions return a boolean. Callers should return early (silently) on false.

function isActorLegit(payload, socket, state) {
    if (!payload || !payload.actor || typeof payload.actor !== 'object') return false;
    if (payload.actor.socketid !== socket.id) return false;
    return state.players.some(p => p.socketid === socket.id);
}

function isCurrentTurnPlayer(socket, state) {
    if (state.currentTurn === null || state.currentTurn === undefined) return false;
    const current = state.players[state.currentTurn];
    if (!current) return false;
    return current.socketid === socket.id;
}

function isSafeValue(value, min, max) {
    return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function areSafeCoords(yxArray) {
    if (!Array.isArray(yxArray) || yxArray.length === 0) return false;
    return yxArray.every(c =>
        Array.isArray(c) &&
        c.length === 2 &&
        Number.isInteger(c[0]) && c[0] >= 0 && c[0] <= 3 &&
        Number.isInteger(c[1]) && c[1] >= 0 && c[1] <= 3
    );
}

function playerOwnsSpell(actor, spellName, state) {
    const player = state.players.find(p => p.id === actor.id);
    if (!player || !player.spells) return false;
    return player.spells.some(spell => spell && spell.name === spellName);
}

function isValidTarget(target, state) {
    if (!target || typeof target !== 'object') return false;
    return state.players.some(p => p.id === target.id);
}

function isPlayerAlive(target, state) {
    if (!target || typeof target !== 'object') return false;
    const player = state.players.find(p => p.id === target.id);
    if (!player) return false;
    return !player.isGhost;
}

module.exports = { isActorLegit, isCurrentTurnPlayer, isSafeValue, areSafeCoords, playerOwnsSpell, isValidTarget, isPlayerAlive };

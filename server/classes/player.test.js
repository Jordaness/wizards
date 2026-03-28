const Player = require('./player');

// Constructor
console.log('--- Player constructor ---');
let p = new Player(1, 'sock1', 'Merlin');
console.assert(p.id === 1, 'id should be 1');
console.assert(p.name === 'Merlin', 'name should be Merlin');
console.assert(p.health === 5, 'health should be 5');
console.assert(p.isGhost === false, 'should not be ghost');

// processApTokens — positive, no overdrive
console.log('--- processApTokens ---');
let p1 = new Player(1, 's', 'Wiz');
p1.aptokens = 2;
let msgs = p1.processApTokens();
console.assert(p1.adjustActions === 1, 'should have 1 extra action, got ' + p1.adjustActions);
console.assert(p1.aptokens === 1, 'should have 1 aptoken left, got ' + p1.aptokens);
console.assert(msgs.length === 1, 'should have 1 message');

// processApTokens — positive, with overdrive
let p2 = new Player(1, 's', 'Wiz');
p2.aptokens = 2;
p2.passives.overdrive = true;
let msgs2 = p2.processApTokens();
console.assert(p2.adjustActions === 2, 'should have 2 extra actions with overdrive, got ' + p2.adjustActions);
console.assert(p2.aptokens === 0, 'should have 0 aptokens, got ' + p2.aptokens);
console.assert(msgs2[0].includes('Overdrive'), 'message should mention Overdrive');

// processApTokens — negative
let p3 = new Player(1, 's', 'Wiz');
p3.aptokens = -1;
let msgs3 = p3.processApTokens();
console.assert(p3.adjustActions === -1, 'should have -1 adjust, got ' + p3.adjustActions);
console.assert(p3.aptokens === 0, 'should have 0 aptokens, got ' + p3.aptokens);

// processApTokens — zero
let p4 = new Player(1, 's', 'Wiz');
p4.aptokens = 0;
let msgs4 = p4.processApTokens();
console.assert(p4.adjustActions === 0, 'should have 0 adjust');
console.assert(msgs4.length === 0, 'should have no messages');

// processHpTokens — positive, no hypermetabolism
console.log('--- processHpTokens ---');
let p5 = new Player(1, 's', 'Wiz');
p5.health = 3;
p5.hptokens = 1;
let r5 = p5.processHpTokens();
console.assert(p5.health === 4, 'should heal to 4, got ' + p5.health);
console.assert(p5.hptokens === 0, 'should have 0 hptokens, got ' + p5.hptokens);
console.assert(r5.tookDamage === false, 'should not have taken damage');

// processHpTokens — positive, with hypermetabolism
let p6 = new Player(1, 's', 'Wiz');
p6.health = 3;
p6.hptokens = 2;
p6.passives.hypermetabolism = true;
let r6 = p6.processHpTokens();
console.assert(p6.health === 5, 'should heal to 5 with hypermetabolism, got ' + p6.health);
console.assert(p6.hptokens === 0, 'should have 0 hptokens, got ' + p6.hptokens);

// processHpTokens — positive, already at max health
let p7 = new Player(1, 's', 'Wiz');
p7.health = 5;
p7.hptokens = 1;
let r7 = p7.processHpTokens();
console.assert(p7.health === 5, 'should stay at 5, got ' + p7.health);
console.assert(p7.hptokens === 0, 'should consume token even at max');

// processHpTokens — negative, no shields
let p8 = new Player(1, 's', 'Wiz');
p8.hptokens = -1;
let r8 = p8.processHpTokens();
console.assert(p8.health === 4, 'should take 1 damage, got ' + p8.health);
console.assert(p8.hptokens === 0, 'should have 0 hptokens, got ' + p8.hptokens);
console.assert(r8.tookDamage === true, 'should report damage taken');

// processHpTokens — negative, with shields
let p9 = new Player(1, 's', 'Wiz');
p9.hptokens = -1;
p9.shields = 2;
let r9 = p9.processHpTokens();
console.assert(p9.health === 5, 'health should be unchanged, got ' + p9.health);
console.assert(p9.shields === 1, 'should lose 1 shield, got ' + p9.shields);
console.assert(r9.tookDamage === false, 'shield absorbed, no damage');

// reset
console.log('--- Player.reset ---');
let p10 = new Player(1, 's', 'Wiz');
p10.health = 1;
p10.shields = 3;
p10.isGhost = true;
p10.aptokens = 5;
p10.hptokens = -2;
p10.passives.brilliance = true;
p10.spells = ['a', 'b'];
p10.reset();
console.assert(p10.health === 5, 'health should reset to 5');
console.assert(p10.shields === 0, 'shields should reset to 0');
console.assert(p10.isGhost === false, 'should not be ghost');
console.assert(p10.aptokens === 0, 'aptokens should be 0');
console.assert(p10.hptokens === 0, 'hptokens should be 0');
console.assert(p10.passives.brilliance === false, 'passives should be reset');
console.assert(p10.spells.length === 0, 'spells should be empty');
console.assert(p10.ready === false, 'ready should be false');

console.log('--- player tests complete ---');

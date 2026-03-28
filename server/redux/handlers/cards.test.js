const { handleDivine, handleUnhighlight, handleWeave, handleScry, handleObscure } = require('./cards');

function makeGrid() {
    return [
        [{ elem: 'fire', faceUp: false }, { elem: 'water', faceUp: false }, { elem: 'earth', faceUp: false }, { elem: 'air', faceUp: false }],
        [{ elem: 'air', faceUp: false }, { elem: 'fire', faceUp: true }, { elem: 'water', faceUp: true }, { elem: 'earth', faceUp: false }],
        [{ elem: 'water', faceUp: false }, { elem: 'earth', faceUp: true }, { elem: 'air', faceUp: true }, { elem: 'fire', faceUp: false }],
        [{ elem: 'earth', faceUp: false }, { elem: 'air', faceUp: false }, { elem: 'fire', faceUp: false }, { elem: 'water', faceUp: false }]
    ];
}

function makeState() {
    return { gameboard: { grid: makeGrid() }, history: [], highlight: [] };
}

// DIVINE
console.log('--- handleDivine ---');
let s1 = makeState();
let r1 = handleDivine(s1, { yx: [[0, 0], [0, 1]], message: 'divine msg' });
console.assert(r1.highlight.length === 2, 'should highlight 2 cards');
console.assert(r1.history.includes('divine msg'), 'should have message');

// UNHIGHLIGHT
console.log('--- handleUnhighlight ---');
let s2 = makeState();
s2.highlight = [[0, 0]];
let r2 = handleUnhighlight(s2, {});
console.assert(r2.highlight.length === 0, 'should clear highlights');

// WEAVE
console.log('--- handleWeave ---');
let s3 = makeState();
let origElem00 = s3.gameboard.grid[0][0].elem;
let origElem33 = s3.gameboard.grid[3][3].elem;
let r3 = handleWeave(s3, { yx1: [0, 0], yx2: [3, 3], message: 'weave msg' });
console.assert(r3.gameboard.grid[0][0].elem === origElem33, 'should swap, got ' + r3.gameboard.grid[0][0].elem);
console.assert(r3.gameboard.grid[3][3].elem === origElem00, 'should swap, got ' + r3.gameboard.grid[3][3].elem);

// SCRY
console.log('--- handleScry ---');
let s4 = makeState();
console.assert(s4.gameboard.grid[0][0].faceUp === false, 'should start face down');
let r4 = handleScry(s4, { yx: [[0, 0], [3, 3]], message: 'scry msg' });
console.assert(r4.gameboard.grid[0][0].faceUp === true, 'should be face up after scry');
console.assert(r4.gameboard.grid[3][3].faceUp === true, 'should be face up after scry');

// OBSCURE
console.log('--- handleObscure ---');
let s5 = makeState();
s5.gameboard.grid[1][1].faceUp = true;
let r5 = handleObscure(s5, { yx: [[1, 1]], message: 'obscure msg' });
console.assert(r5.gameboard.grid[1][1].faceUp === false, 'should be face down after obscure');

console.log('--- cards tests complete ---');

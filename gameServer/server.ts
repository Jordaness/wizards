// WIZARD CARD DUELS

// Programmed at Coding Dojo Bellevue, June 2018, by Wizards 'Я' Us
// (Jordan Hudson, Alex Hunter, and Jym Tuesday Paschall)

// Angular front-end and SASS styling by Jordan Hudson
// Socket and event handling by Jym Paschall
// Express/Redux back-end and game design by Alex Hunter


const express = require('express');
const app = express();
const server = app.listen(8000);

const gameStore = require('./redux/store');
const actions = require('./redux/actions')

const path = require('path');

const bodyParser = require('body-parser');
const io = require('socket.io').listen(server);
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../public/dist/public')));

// require('./mongoose/mongoose.js');

gameStore.dispatch(actions.gameSetup());

app.get('/test', (req, res, next) => {
    console.log(gameStore.getState());
    res.json(gameStore.getState());
});

app.all("*", (req, res, next) => {
    res.sendFile(path.resolve("./public/dist/public/index.html"))
});

// socket whatevers
let sox = require('./sockets')(io);

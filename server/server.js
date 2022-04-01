const express = require('express');
const app = express();
const port = 8080;
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: ['14.34.17.121:3000'],
        methods: ["GET", "POST"],
    }
});
const cors = require('cors');
const path = require('path');
const Client = require('./Client')
const GameServer = require('./GameServer')

app.use(cors());

app.get('/', (req, res) => {
    res.send({ message: 'hello' });
});

let clients = {};
let games = {};
let userCount = -1;
let waitClient = '';



io.on('connection', socket => {
    clients[socket.id] = new Client(++userCount, socket.id);
    clients[userCount] = socket.id;
    console.log(`User ${userCount} (id:${socket.id}) connected!`);


    //socket.on

    socket.on('disconnect', () => {
        console.log(`User ${clients[socket.id].number} (id:${socket.id}) disconnected!`);
        if (clients[socket.id].isGaming) {
            const enemyId = clients[socket.id].enemyId;
            const main = clients[socket.id].gameInfo.main ? socket.id : enemyId;
            delete games[main];
            clients[enemyId].isGaming = false;
            io.to(enemyId).emit('response : enemy disconnected');
        }
        if (waitClient === socket.id)
            waitClient = '';
        delete clients[socket.id];
    });

    socket.on('request : matching', () => {
        console.log(`User ${clients[socket.id].number} (id:${socket.id}) request matching ${new Date().toISOString()}`);
        if (Matching(socket.id)) {
            const enemyId = clients[socket.id].enemyId;
            games[socket.id] = new GameServer(socket.id, enemyId);

            io.to(socket.id).emit('response : game start', clients[socket.id].gameInfo);

            clients[enemyId].gameInfo.initTurn = false;
            clients[enemyId].gameInfo.main = false;
            io.to(enemyId).emit('response : game start', clients[enemyId].gameInfo);
        }
    });

    socket.on('request : round start', () => {
        try {
            const enemyId = games[socket.id].player2.id;
            console.log(`   User ${clients[socket.id].number} round start! / ${new Date().toISOString()}`);
            let deckSize = games[socket.id].deck.length;
            let ind = Math.floor(Math.random() * deckSize);
            games[socket.id].player1.card = games[socket.id].deck[ind];
            clients[socket.id].gameInfo.card = games[socket.id].deck[ind];
            games[socket.id].deck = [...games[socket.id].deck.slice(0, ind), ...games[socket.id].deck.slice(ind + 1, deckSize)];
            games[socket.id].player1.chips--;

            deckSize--;
            ind = Math.floor(Math.random() * deckSize);
            if (games[socket.id].deck[ind] === undefined)
                console.log(`       Warning!! decksize : ${deckSize}, ind : ${ind}, card : ${games[socket.id].deck[ind]}, cardArray : ${games[socket.id].deck}`);
            games[socket.id].player2.card = games[socket.id].deck[ind];
            clients[socket.id].gameInfo.card = games[socket.id].deck[ind];
            games[socket.id].deck = [...games[socket.id].deck.slice(0, ind), ...games[socket.id].deck.slice(ind + 1, deckSize)];
            games[socket.id].player2.chips--;

            games[socket.id].totalBetChips = 2;

            console.log(`   User ${clients[socket.id].number} card : ${games[socket.id].player1.card} , User ${clients[enemyId].number} card : ${games[socket.id].player2.card} / deck : ${games[socket.id].deck}`);

            io.to(socket.id).emit('response : round start', games[socket.id]);
            io.to(enemyId).emit('response : round start', games[socket.id]);
        }
        catch { }
    });

    socket.on('request : raise', (raiseChips) => {
        try {
            console.log(`   User ${clients[socket.id].number} raise ${raiseChips} / ${new Date().toISOString()}`);
            const enemyId = clients[socket.id].enemyId;
            const main = clients[socket.id].gameInfo.main ? socket.id : enemyId;
            games[main][`player${main === socket.id ? '1' : '2'}`].chips -= games[main].lastBetChips + raiseChips;
            games[main].totalBetChips += games[main].lastBetChips + raiseChips;
            games[main].phase++;
            games[main].ToggleTurn();
            games[main].lastBetType = 'raise';
            games[main].lastBetChips = raiseChips;

            io.to(socket.id).emit(`response : increase phase`, games[main]);
            io.to(enemyId).emit(`response : increase phase`, games[main]);
        }
        catch { }
    });

    socket.on('request : check', () => {
        try {
            console.log(`   User ${clients[socket.id].number} check / ${new Date().toISOString()}`);
            const enemyId = clients[socket.id].enemyId;
            const main = clients[socket.id].gameInfo.main ? socket.id : enemyId;
            games[main].phase++;
            games[main].ToggleTurn();
            games[main].lastBetType = 'check';
            games[main].lastBetChips = 0;

            io.to(socket.id).emit(`response : increase phase`, games[main]);
            io.to(enemyId).emit(`response : increase phase`, games[main]);
        }
        catch { }
    });
    socket.on('request : call', () => {
        try {
            console.log(`   User ${clients[socket.id].number} call / ${new Date().toISOString()}`);
            const enemyId = clients[socket.id].enemyId;
            const main = clients[socket.id].gameInfo.main ? socket.id : enemyId;

            games[main][`player${main === socket.id ? '1' : '2'}`].chips -= games[main].lastBetChips;
            games[main].totalBetChips += games[main].lastBetChips;
            if ((games[main].player1.card % 10) === (games[main].player2.card % 10)) {
                games[main].player1.chips += games[main].totalBetChips / 2;
                games[main].player2.chips += games[main].totalBetChips / 2;
            }
            else {
                const card1 = (games[main].player1.card % 10) === 0 ? 10 : games[main].player1.card;
                const card2 = (games[main].player2.card % 10) === 0 ? 10 : games[main].player2.card;
                const bool = card1 > card2;
                games[main][`player${bool ? '1' : '2'}`].chips += games[main].totalBetChips;
            }
            games[main].ToggleTurn();
            games[main].lastBetType = 'call';

            io.to(socket.id).emit(`response : end round`, games[main]);
            io.to(enemyId).emit(`response : end round`, games[main]);
        }
        catch { }
    });
    socket.on('request : die', () => {
        try {
            console.log(`   User ${clients[socket.id].number} die / ${new Date().toISOString()}`);
            const enemyId = clients[socket.id].enemyId;
            const main = clients[socket.id].gameInfo.main ? socket.id : enemyId;

            games[main].ToggleTurn();
            games[main].lastBetType = 'die';
            games[main][`player${main === socket.id ? '2' : '1'}`].chips += games[main].totalBetChips;

            io.to(socket.id).emit(`response : end round`, games[main]);
            io.to(enemyId).emit(`response : end round`, games[main]);
        }
        catch { }
    });
    socket.on('request : round complete', () => {
        try {
            console.log(`   User ${clients[socket.id].number} round${games[socket.id].round} complete / ${new Date().toISOString()}`);
            if (games[socket.id].player1.chips < 1 || games[socket.id].player2.chips < 1) {
                clients[socket.id].isGaming = false;
                clients[clients[socket.id].enemyId].isGaming = false;
                io.to(socket.id).emit(`response : game over`, games[socket.id]);
                io.to(clients[socket.id].enemyId).emit(`response : game over`, games[socket.id]);
            }
            else {
                io.to(socket.id).emit(`order : round start`, games[socket.id]);
            }
            delete games[socket.id];
        }
        catch { }
    });
});

http.listen(port, () => {
    console.log('server is running on ' + String(port));
})

function Matching(id) {
    if (clients[id].isGaming) {
        console.log(`User ${clients[id].number} is Gaming now!`);
    }
    else if (waitClient.length === 0) {
        waitClient = id;
        io.to(id).emit('response : matching fail');
        clients[id].isGaming = false;
        console.log(`User ${clients[id].number} matching Failed...`);
    }
    else if (waitClient === id) {
        console.log(`User ${clients[id].number} is already waiting`);
    }
    else {
        io.to(id).emit('response : matching success', waitClient);
        clients[id].isGaming = true;
        clients[id].enemyId = waitClient;
        io.to(waitClient).emit('response : matching success', id);
        clients[waitClient].isGaming = true;
        clients[waitClient].enemyId = id;
        console.log(`User ${clients[id].number}, user ${clients[waitClient].number} is matched! ${new Date().toISOString()}`);
        waitClient = '';
        return true;
    }
    return false;
}
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

    let TimeCheck = setInterval(() => {
        const now = new Date().getTime();
        let res = [];
        let isChanged = false;
        for (let i in clients[socket.id].lastTime) {
            if (now - clients[socket.id].lastTime[i] >= 2000) {
                res.push(i);
                clients[socket.id].lastTime[i] = 9999999999999;
                isChanged = true;
            }
        }
        isChanged && io.to(socket.id).emit(`order : turn off chips change`, res);
    }, 100);


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
        clearInterval(TimeCheck);
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
            if (deckSize === 0) {
                games[socket.id].deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
                deckSize = 20;
            }
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
            console.log(`main round start`);
            io.to(enemyId).emit('response : round start', games[socket.id]);
            console.log(`enemy round start`);
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
                const card1 = (games[main].player1.card % 10) === 0 ? 10 : (games[main].player1.card % 10);
                const card2 = (games[main].player2.card % 10) === 0 ? 10 : (games[main].player2.card % 10);
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

            if (games[main][`player${main === socket.id ? '1' : '2'}`].card % 10 === 0) {
                games[main][`player${main === socket.id ? '1' : '2'}`].chips -= 5;
                games[main][`player${main === socket.id ? '2' : '1'}`].chips += 5;
                games[main].isTenDie = true;
            }

            io.to(socket.id).emit(`response : end round`, games[main]);
            io.to(enemyId).emit(`response : end round`, games[main]);
            games[main].isTenDie = false;
        }
        catch (e) {
            console.log(`   ERROR! when User ${clients[socket.id].number} request die.
            error : ${e}`);
        }
    });
    socket.on('request : round complete', () => {
        try {
            console.log(`   User ${clients[socket.id].number} round${games[socket.id].round} complete / ${new Date().toISOString()}`);
            console.log(`   ${games[socket.id].player1.chips} : ${games[socket.id].player2.chips}`);
            if (games[socket.id].player1.chips < 1 || games[socket.id].player2.chips < 1) {
                clients[socket.id].isGaming = false;
                clients[clients[socket.id].enemyId].isGaming = false;
                io.to(socket.id).emit(`response : game over`, games[socket.id]);
                io.to(clients[socket.id].enemyId).emit(`response : game over`, games[socket.id]);
                delete games[socket.id];
            }
            else {
                io.to(socket.id).emit(`order : round start`, games[socket.id]);
                if (games[socket.id].round % 10 === 0)
                    io.to(clients[socket.id].enemyId).emit(`order : deck shuffle`);
                games[socket.id].round++;
            }
        }
        catch { }
    });

    socket.on('request : input new date', (keyAndDate) => {
        clients[socket.id].lastTime[keyAndDate[0]] = keyAndDate[1];
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
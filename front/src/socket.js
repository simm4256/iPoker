import { changeEnemyValue } from "./store/enemy";
import { initGame, changeInfoValue, endRound, endRound2, gameOver, increasePhase, initRound, toggleInfoValue } from "./store/gameInfo";
import { changePage } from "./store/page";

export default function Socket(socket, dispatch) {
    let isMain;
    let my, enemy;
    const interval = 1500;
    socket.on('response : matching fail', () => {
        dispatch(changePage('matchingPage'));
    });
    socket.on('response : matching success', (enemyId) => {
        dispatch(changeInfoValue(['enemyId', enemyId]));
    });
    socket.on('response : game start', (gameInfo) => {
        dispatch(initGame(gameInfo));
        dispatch(changePage('gamePage'));
        isMain = gameInfo.main;
        my = isMain ? 'player1' : 'player2';
        enemy = isMain ? 'player2' : 'player1';
    });
    socket.on('response : round start', (gameServer) => {
        dispatch(initRound([gameServer, my, enemy]));
    });
    socket.on(`response : increase phase`, (gameServer) => {
        dispatch(increasePhase(gameServer));
    });
    socket.on(`response : end round`, (gameServer) => {
        dispatch(endRound(gameServer));
        let i = 0;
        const tmp = setInterval(() => {
            if (++i < 3)
                dispatch(endRound(gameServer));
            else
                dispatch(endRound(socket));
            if (i === 3)
                clearInterval(tmp);
        }, interval);
    });
    socket.on(`response : game over`, (gameServer) => {
        dispatch(gameOver(false));
        setTimeout(() => {
            dispatch(initGame({ main: true, chips: 20, myTurn: true }));
            dispatch(changePage('mainPage'));
        }, 5000);
    });
    socket.on(`order : round start`, () => {
        socket.emit(`request : round start`);
    });
    socket.on('response : enemy disconnected', () => {
        dispatch(gameOver(true));
        setTimeout(() => {
            dispatch(initGame({ main: true, chips: 20, myTurn: true }));
            dispatch(changePage('mainPage'));
        }, 5000);
    });
}
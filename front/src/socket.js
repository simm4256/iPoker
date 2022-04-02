import { initGame, changeInfoValue, endRound, gameOver, increasePhase, initRound, toggleInfoValue, turnOffChipsChange, tenDie } from "./store/gameInfo";
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
        dispatch(initRound([gameServer, my, enemy, socket]));
    });
    socket.on(`response : increase phase`, (gameServer) => {
        dispatch(increasePhase([gameServer, socket]));
    });
    socket.on(`response : end round`, (gameServer) => {
        dispatch(endRound([gameServer, socket, 1]));
        const fn = async () => {
            const process1 = await new Promise((res, rej) => {
                setTimeout(() => {
                    dispatch(endRound([gameServer, socket, 2]));
                    res();
                }, interval);
            })
            const process2 = gameServer.isTenDie ?
                await new Promise((res, rej) => {
                    setTimeout(() => {
                        dispatch(tenDie(socket));
                        res();
                    }, interval);
                })
                : null;
            const process3 = await new Promise((res, rej) => {
                setTimeout(() => {
                    dispatch(endRound([gameServer, socket, 3]));
                    res();
                }, interval);
            })
            const process4 = await new Promise((res, rej) => {
                setTimeout(() => {
                    dispatch(endRound([gameServer, socket, 4]));
                    res();
                }, interval);
            })
        }
        fn();
    });
    socket.on(`response : game over`, (gameServer) => {
        dispatch(gameOver(false));
        setTimeout(() => {
            dispatch(initGame({ main: true, chips: 20, myTurn: true }));
            dispatch(changePage('mainPage'));
        }, 5000);
    });
    socket.on(`order : round start`, (gameServer) => {
        if (gameServer.round % 10 === 0) {
            dispatch(changeInfoValue(['visibleTenDie', false]));
            dispatch(changeInfoValue(['visibleDeckShffle', true]));
            setTimeout(() => {
                socket.emit(`request : round start`);
                dispatch(changeInfoValue(['visibleDeckShffle', false]));
            }, 3000);
        }
        else
            socket.emit(`request : round start`);
    });
    socket.on(`order : deck shuffle`, () => {
        dispatch(changeInfoValue(['visibleTenDie', false]));
        dispatch(changeInfoValue(['visibleDeckShffle', true]));
        setTimeout(() => {
            dispatch(changeInfoValue(['visibleDeckShffle', false]));
        }, 3000);
    });
    socket.on('response : enemy disconnected', () => {
        dispatch(gameOver(true));
        setTimeout(() => {
            dispatch(initGame({ main: true, chips: 20, myTurn: true }));
            dispatch(changePage('mainPage'));
        }, 5000);
    });
    socket.on(`order : turn off chips change`, (changeKeyArray) => {
        dispatch(turnOffChipsChange(changeKeyArray));
    });
}
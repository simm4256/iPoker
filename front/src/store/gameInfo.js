import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    main: true,
    round: 0,
    phase: 1,
    chips: 20,
    card: -1,
    text: '(대기중)',
    myTurn: true,
    bettedChips: 0,
    lastRaisedChips: 0,
    lastBetType: '',
    lastBetChips: -1,
    isChecked: false,

    enemyId: '',
    enemyChips: 20,
    enemyCard: -1,
    enemyText: '',

    visiblePlay: 'default',
    visibleResult: false,
    visibleDeckShffle: false,
    visibleTenDie: false,

    chipsChange: 0,
    chipsChangeVisible: false,
    enemyChipsChange: 0,
    enemyChipsChangeVisible: false,
    boardChipsChange: 0,
    boardChipsChangeVisible: false,
}

function InputNewDate(state, key, date, socket) {
    state[key + 'Visible'] = true;
    socket.emit(`request : input new date`, [key, date]);
}

export const gameInfoSlice = createSlice({
    name: 'gameInfo',
    initialState,
    reducers: {
        initGame: (state, action) => {
            state.main = action.payload.main;
            state.myTurn = action.payload.initTurn;
            state.chips = state.enemyChips = 20;
            state.visibleResult = state.visibleDeckShffle = false;
            if (!state.myTurn)
                state.visiblePlay = 'text';
            state.round = 0;
            state.isChecked = false;

            state.chipsChange = 0;
            state.enemyChipsChange = 0;
            state.boardChipsChange = 0;
        },
        toggleInfoValue: (state, action) => {
            state[action.payload] = !state[action.payload];
        },
        changeInfoValue: (state, action) => {
            if (action.payload[0] === 'enemyCard') {
                state.enemyCard = action.payload[1] % 10;
                if (state.enemyCard === 0)
                    state.enemyCard = 10;
            }
            else if (typeof action.payload[1] === 'string' && !isNaN(Number(action.payload[1])))
                state[action.payload[0]] += Number(action.payload[1]);
            else
                state[action.payload[0]] = action.payload[1];
        },
        initRound: (state, action) => {
            const socket = action.payload[3];
            state.round++;
            if (state.main)
                state.myTurn = (state.round % 2 === 0) ? false : true;
            else
                state.myTurn = (state.round % 2 === 0) ? true : false;
            state.card = action.payload[0][action.payload[1]].card % 10;
            state.enemyCard = action.payload[0][action.payload[2]].card % 10;
            state.card = state.card === 0 ? 10 : state.card;
            state.enemyCard = state.enemyCard === 0 ? 10 : state.enemyCard;
            state.chips -= 1;
            state.chipsChange = '-1';

            InputNewDate(state, 'chipsChange', new Date().getTime(), socket);
            state.enemyChips -= 1;
            state.enemyChipsChange = '-1';

            InputNewDate(state, 'enemyChipsChange', new Date().getTime(), socket);
            state.bettedChips = 2;
            state.boardChipsChange = '+2';

            InputNewDate(state, 'boardChipsChange', new Date().getTime(), socket);
            state.phase = 1;
            state.enemyText = state.myTurn ? '' : '...';
            state.text = '';
            state.visiblePlay = state.myTurn ? `default` : `text`;
            state.lastRaisedChips = 0;
            state.lastBetType = '';
            state.isChecked = false;
            state.visibleTenDie = false;
        },
        increasePhase: (state, action) => {
            const socket = action.payload[1];
            const lastBetType = action.payload[0].lastBetType;
            const lastBetChips = action.payload[0].lastBetChips
            state.myTurn = !state.myTurn;
            state.bettedChips += lastBetChips + state.lastRaisedChips;
            if (lastBetChips + state.lastRaisedChips > 0) {
                state.boardChipsChange = `+${lastBetChips + state.lastRaisedChips}`;

                InputNewDate(state, 'boardChipsChange', new Date().getTime(), socket);
            }
            state.phase++;
            if (!state.myTurn) {
                state.chips -= lastBetChips + state.lastRaisedChips;
                if (lastBetChips + state.lastRaisedChips > 0) {
                    state.chipsChange = `-${lastBetChips + state.lastRaisedChips}`;

                    InputNewDate(state, 'chipsChange', new Date().getTime(), socket);
                }
                state.enemyText = '...';
                if (lastBetType === 'check')
                    state.text = `체크`;
                else if (state.lastRaisedChips === 0)
                    state.text = `${lastBetChips}개\n레이즈`;
                else
                    state.text = `${state.lastRaisedChips}개 받고\n${lastBetChips}개 더`;
                state.visiblePlay = 'text';
            }
            else {
                state.enemyChips -= lastBetChips + state.lastRaisedChips;
                if (lastBetChips + state.lastRaisedChips > 0) {
                    state.enemyChipsChange = `-${lastBetChips + state.lastRaisedChips}`;

                    InputNewDate(state, 'enemyChipsChange', new Date().getTime(), socket);
                }
                if (lastBetType === 'check')
                    state.enemyText = `체크`;
                else if (state.lastRaisedChips === 0)
                    state.enemyText = `${lastBetChips}개\n레이즈`;
                else
                    state.enemyText = `${state.lastRaisedChips}개 받고\n${lastBetChips}개 더`;
                state.visiblePlay = 'default';
            }
            state.lastRaisedChips = lastBetChips;
        },
        endRound: (state, action) => {
            const gameServer = action.payload[0];
            const socket = action.payload[1];
            if (state.phase > -1) {
                if (action.payload[2] !== 1) {
                    console.log(`err! round${state.round}, process${action.payload[2]}`);
                    return;
                }
                [state.lastBetType, state.lastBetChips] = [gameServer.lastBetType, gameServer.lastBetChips];


                if (state.lastBetType === 'call') {
                    state.bettedChips += state.lastBetChips;
                    if (state.lastBetChips > 0) {
                        state.boardChipsChange = `+${state.lastBetChips}`;

                        InputNewDate(state, 'boardChipsChange', new Date().getTime(), socket);
                    }
                }
                if (state.myTurn) {
                    state.visiblePlay = 'text';
                    state.text = (state.lastBetType === 'call' ? '콜' : '다이');
                    if (state.lastBetType === 'call') {
                        state.chips -= state.lastBetChips;
                        if (state.lastBetChips > 0) {
                            state.chipsChange = `-${state.lastBetChips}`;
                            InputNewDate(state, 'chipsChange', new Date().getTime(), socket);
                        }
                    }
                }
                else {
                    state.enemyText = (state.lastBetType === 'call' ? '콜' : '다이');
                    if (state.lastBetType === 'call') {
                        state.enemyChips -= state.lastBetChips;
                        if (state.lastBetChips > 0) {
                            state.enemyChipsChange = `-${state.lastBetChips}`;
                            InputNewDate(state, 'enemyChipsChange', new Date().getTime(), socket);
                        }
                    }
                }
                state.phase = -1;
            }
            else {
                state.phase--;
                if (state.phase === -3) {
                    if (state.lastBetType === 'call') {
                        if (state.card > state.enemyCard) {
                            state.chips += state.bettedChips;
                            state.chipsChange = `+${state.bettedChips}`;

                            InputNewDate(state, 'chipsChange', new Date().getTime(), socket);
                        }
                        else if (state.card < state.enemyCard) {
                            state.enemyChips += state.bettedChips;
                            state.enemyChipsChange = `+${state.bettedChips}`;

                            InputNewDate(state, 'enemyChipsChange', new Date().getTime(), socket);
                        }
                        else {
                            state.chips += state.bettedChips / 2;
                            state.chipsChange = `+${state.bettedChips / 2}`;
                            InputNewDate(state, 'chipsChange', new Date().getTime(), socket);

                            state.enemyChips += state.bettedChips / 2;
                            state.enemyChipsChange = `+${state.bettedChips / 2}`;
                            InputNewDate(state, 'enemyChipsChange', new Date().getTime(), socket);
                        }
                    }
                    else {
                        if (state.myTurn) {
                            state.enemyChips += state.bettedChips;
                            state.enemyChipsChange = `+${state.bettedChips}`;
                            InputNewDate(state, 'enemyChipsChange', new Date().getTime(), socket);
                        }
                        else {
                            state.chips += state.bettedChips;
                            state.chipsChange = `+${state.bettedChips}`;
                            InputNewDate(state, 'chipsChange', new Date().getTime(), socket);
                        }
                    }
                }
                if (state.phase === -4)
                    state.main && socket.emit('request : round complete');
            }
        },
        gameOver: (state, action) => {
            if (action.payload)
                state.chips = 999;
            state.visibleResult = true;
        },
        turnOffChipsChange: (state, action) => {
            for (let i of action.payload) {
                state[i + 'Visible'] = false;
            }
        },
        tenDie: (state, action) => {
            const socket = action.payload;
            state.visibleTenDie = true;
            let reducedChips = state.myTurn ? Math.min(5, state.chips) : Math.min(5, state.enemyChips);
            if (reducedChips < 1)
                return;
            if (state.myTurn) {
                state.chips -= reducedChips;
                state.chipsChange = `-${reducedChips}`;
                InputNewDate(state, 'chipsChange', new Date().getTime(), socket);
            }
            else {
                state.enemyChips -= reducedChips;
                state.enemyChipsChange = `-${reducedChips}`;
                InputNewDate(state, 'enemyChipsChange', new Date().getTime(), socket);
            }
            state.bettedChips += reducedChips;
            state.boardChipsChange = `+${reducedChips}`;
            InputNewDate(state, 'boardChipsChange', new Date().getTime(), socket);

        },
    },
})

export const { initGame, changeInfoAll, changeInfoValue, toggleInfoValue, initRound, increasePhase, endRound, gameOver, turnOffChipsChange, tenDie } = gameInfoSlice.actions

export default gameInfoSlice.reducer
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

    enemyId: '',
    enemyChips: 20,
    enemyCard: -1,
    enemyText: '',

    visiblePlay: 'default',
    visibleResult: false,
}

export const gameInfoSlice = createSlice({
    name: 'gameInfo',
    initialState,
    reducers: {
        initGame: (state, action) => {
            state.main = action.payload.main;
            state.myTurn = action.payload.initTurn;
            state.chips = state.enemyChips = 20;
            state.visibleResult = false;
            if (!state.myTurn)
                state.visiblePlay = 'text';
            state.round = 0;
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
            state.round++;
            if (state.main)
                state.myTurn = (state.round % 2 === 0) ? false : true;
            else
                state.myTurn = (state.round % 2 === 0) ? true : false;
            state.card = action.payload[0][action.payload[1]].card % 10;
            state.enemyCard = action.payload[0][action.payload[2]].card % 10;
            state.card = state.card === 0 ? 10 : state.card;
            state.enemyCard = state.enemyCard === 0 ? 10 : state.enemyCard;
            state.bettedChips = 2;
            state.chips -= 1;
            state.enemyChips -= 1;
            state.phase = 1;
            state.enemyText = state.myTurn ? '' : '...';
            state.text = '';
            state.visiblePlay = state.myTurn ? `default` : `text`;
            state.lastRaisedChips = 0;
            state.lastBetType = '';
        },
        increasePhase: (state, action) => {
            const lastBetType = action.payload.lastBetType;
            const lastBetChips = action.payload.lastBetChips
            state.myTurn = !state.myTurn;
            state.bettedChips += lastBetChips + state.lastRaisedChips;
            state.phase++;
            if (!state.myTurn) {
                state.chips -= lastBetChips + state.lastRaisedChips;
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
            if (state.phase > -1) {
                const gameServer = action.payload;
                [state.lastBetType, state.lastBetChips] = [gameServer.lastBetType, gameServer.lastBetChips];

                //1. 판 업데이트 (like increasePhase)
                if (state.lastBetType === 'call')
                    state.bettedChips += state.lastBetChips;
                if (state.myTurn) {
                    state.visiblePlay = 'text';
                    state.text = (state.lastBetType === 'call' ? '콜' : '다이');
                    if (state.lastBetType === 'call')
                        state.chips -= state.lastBetChips;
                }
                else {
                    state.enemyText = (state.lastBetType === 'call' ? '콜' : '다이');
                    if (state.lastBetType === 'call')
                        state.enemyChips -= state.lastBetChips;
                }
                state.phase = -1;
            }
            else {
                state.phase--;
                if (state.phase === -3) {
                    if (state.lastBetType === 'call') {
                        if (state.card > state.enemyCard) {
                            state.chips += state.bettedChips;
                        }
                        else if (state.card < state.enemyCard) {
                            state.enemyChips += state.bettedChips;
                        }
                        else {
                            state.chips += state.bettedChips / 2;
                            state.enemyChips += state.bettedChips / 2;
                        }
                    }
                    else {
                        if (state.myTurn)
                            state.enemyChips += state.bettedChips;
                        else
                            state.chips += state.bettedChips;
                    }
                }
                if (state.phase === -4)
                    state.main && action.payload.emit('request : round complete');
            }
        },
        gameOver: (state, action) => {
            if (action.payload)
                state.chips = 999;
            state.visibleResult = true;
        }
    },
})

export const { initGame, changeInfoAll, changeInfoValue, toggleInfoValue, initRound, increasePhase, endRound, gameOver } = gameInfoSlice.actions

export default gameInfoSlice.reducer
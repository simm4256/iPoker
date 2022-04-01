import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    id: '',
    card: -1,
    chips: 20,
    text: ``,
}

export const enemySlice = createSlice({
    name: 'enemy',
    initialState,
    reducers: {
        changeEnemyAll: (state, action) => {
            state.main = action.payload.main;
            state.round = action.payload.round;
            state.chips = action.payload.chips;
            state.myTurn = action.payload.myTurn;
        },
        changeEnemyValue: (state, action) => {
            if (typeof action.payload[1] === 'string')
                state[action.payload[0]] += Number(action.payload[1]);
            else {
                state[action.payload[0]] = action.payload[1];
                if (action.payload[0] === 'card') {
                    state.card %= 10;
                    if (state.card === 0)
                        state.card = 10;
                }
            }
        },
        toggleEnemyValue: (state, action) => {
            state[action.payload] = !state[action.payload];
        },
    },
})

export const { changeEnemyAll, changeEnemyValue, toggleEnemyValue } = enemySlice.actions

export default enemySlice.reducer
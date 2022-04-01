import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    play: 'text',
}

export const visibleSlice = createSlice({
    name: 'visible',
    initialState,
    reducers: {
        changeVisibleValue: (state, action) => {
            state[action.payload[0]] = action.payload[1];
        },
    },
})

export const { changeVisibleValue } = visibleSlice.actions

export default visibleSlice.reducer
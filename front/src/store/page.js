import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    pageName: 'mainPage',
}

export const pageSlice = createSlice({
    name: 'page',
    initialState,
    reducers: {
        changePage: (state, action) => {
            state.pageName = action.payload;
        },
    },
})

export const { changePage } = pageSlice.actions

export default pageSlice.reducer
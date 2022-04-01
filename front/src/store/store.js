import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import pageReducer from './page'
import enemyReducer from './enemy'
import visibleReducer from './visible'
import gameInfoReducer from './gameInfo'

export const store = configureStore({
    reducer: {
        page: pageReducer,
        gameInfo: gameInfoReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        }),

})
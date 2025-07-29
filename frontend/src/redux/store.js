import {combineReducers, configureStore} from '@reduxjs/toolkit'
import authReducer from "./authSlice.js";
import postReducer from "./postSlice.js";
import socketReducer from "./socketSlide.js";
import chatReducer from "./chatSlice.js";
import rtnReducer from "./rtnSlice.js";
import reelReducer from "./reelSlice.js";

import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

const persistConfig = {
    key: 'root',
    version: 2,
    storage,
    stateReconciler: autoMergeLevel2,
}

const rootReducer = combineReducers({
    auth:authReducer,
    post:postReducer,
    socketio:socketReducer,
    chat:chatReducer,
    realTimeNotification:rtnReducer,
    reel:reelReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
       getDefaultMiddleware({
           serializableCheck: {
               ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
           },
       }),
})
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    likeNotification:[],
}

export const rtnSlice = createSlice({
    name: 'realTimeNotification',
    initialState,
    reducers: {
        //actions
        setLikeNotification:(state,action)=>{
            if(action.payload.type==='like'){
                state.likeNotification.push(action.payload);
            }else{
                state.likeNotification=state.likeNotification.filter(item=>item.userId!==action.payload.userId);
            }
        },
        clearLikeNotification:(state,action)=>{
            state.likeNotification=[];
        }

    },
})

// Action creators are generated for each case reducer function
export const {setLikeNotification,clearLikeNotification} = rtnSlice.actions

export default rtnSlice.reducer
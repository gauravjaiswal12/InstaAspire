import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    onlineUsers:[],
    messages:[],
    messageNotification:[],
}

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setOnlineUsers:(state,action)=>{
            state.onlineUsers=action.payload;
        },
        setMessages:(state,action)=>{
            state.messages=action.payload;
        },
        setMessagesNotification:(state,action)=>{
            state.messageNotification.push(action.payload);
        },
        clearMsgNotification:(state,action)=>{
            state.messageNotification=[];
        }
    },
})

// Action creators are generated for each case reducer function
export const {setOnlineUsers,setMessages,setMessagesNotification,clearMsgNotification} = chatSlice.actions

export default chatSlice.reducer
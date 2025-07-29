import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {setMessages, setMessagesNotification} from "@/redux/chatSlice.js";

const useGetRTM = () => {
    const dispatch=useDispatch();
    const {socket}=useSelector((state)=>state.socketio);
    const {messages}=useSelector((state)=>state.chat);

    useEffect(() => {
        socket?.on('newMessage',(newMessage)=>{
            dispatch(setMessages([...messages,newMessage]));

        })
        return ()=>{
            socket?.off('newMessage');
        }
    },[messages, socket, dispatch])
};

export default useGetRTM;
// messages,setMessages this was ealrier the dependency array
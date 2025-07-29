import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {setMessages} from "@/redux/chatSlice.js";

const useGetAllMessages = () => {
   const dispatch=useDispatch();
   const {selectedUser}=useSelector((state)=>state.auth);

   useEffect(() => {
       const fetchAllMessages = async () => {
           try{
               const res=await axios.get(`http://localhost:8000/api/v1/message/all/${selectedUser?._id}`,{withCredentials:true});
               if(res.data.success){
                   dispatch(setMessages(res.data.messages));
               }
           }catch(err){
               console.log(err);
           }
       };
       fetchAllMessages();
   },[selectedUser])
};

export default useGetAllMessages;

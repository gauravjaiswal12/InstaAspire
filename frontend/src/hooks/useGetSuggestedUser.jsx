import React, {useEffect} from 'react';
import {useDispatch} from "react-redux";
import axios from "axios";
import {setSuggestedUsers} from "@/redux/authSlice.js";

const useGetSuggestedUser = () => {
  const dispatch=useDispatch();
  useEffect(() => {
      const fetchSuggestedUser = async () => {
          try{
              console.log("fetching the suggested user");
              const res=await axios.get('http://localhost:8000/api/v1/user/suggested',{withCredentials:true});
              console.log("printing the res of suggested user",res.data.users);
              if(res.data.success){

                  dispatch(setSuggestedUsers(res.data.users));
              }
          }catch(err){
              console.log(err);
          }
      }
      fetchSuggestedUser();
  },[])
};

export default useGetSuggestedUser;

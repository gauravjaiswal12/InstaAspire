import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {setSuggestedReels} from "@/redux/reelSlice.js";

const useGetSuggestedReels = () => {
    const dispatch=useDispatch();
    const {user}=useSelector(state=>state.auth);
    const fetchUserReels = async () => {
        try{
            const response=await axios.get("http://localhost:8080/api/v1/reel/BestReels",{withCredentials:true});
            console.log("printing the fetchUserReels",response);
            if(response.data.success){
                dispatch(setSuggestedReels(response.data.data));
            }

        }catch(e){
            console.log(e);
        }
    }
    useEffect(() => {
        fetchUserReels();
    }, [user]);
};

export default useGetSuggestedReels;

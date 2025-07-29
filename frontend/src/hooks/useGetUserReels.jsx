import React, {useEffect} from 'react';
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import {setSignedUserReels} from "@/redux/reelSlice.js";

const useGetUserReels = () => {
    const dispatch=useDispatch();
    const {user}=useSelector(state=>state.auth);
    const fetchUserReels = async () => {
        try{
            const response=await axios.get("http://localhost:8080/api/v1/reel/UserReels",{withCredentials:true});
            console.log("printing the fetchUserReels",response);
            if(response.data.success){
                dispatch(setSignedUserReels(response.data.reels));
            }

        }catch(e){
            console.log(e);
        }
    }
    useEffect(() => {
        fetchUserReels();
    }, [user]);
};

export default useGetUserReels;

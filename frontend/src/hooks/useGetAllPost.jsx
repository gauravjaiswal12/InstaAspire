import {useEffect} from "react";
import axios from "axios";
import {useDispatch} from "react-redux";
import {setPosts} from "@/redux/postSlice.js";

export const useGetAllPost = () => {
    const dispatch=useDispatch();
    useEffect(() => {
        const fetchAllPost = async () => {
            try{
                const res=await axios.get('http://localhost:8000/api/v1/post/all',{withCredentials:true});
                if(res.data.success){
                    console.log("printing all the posts",res.data.posts);
                    dispatch(setPosts(res.data.posts));
                }
            }catch (e) {
                console.log(e);
            }
        }
        fetchAllPost();
    }, []);
}
import React from 'react';
import Post from "@/components/Post.jsx";
import {useSelector} from "react-redux";

const Posts = () => {
    const {posts}=useSelector((state)=>state.post);
    return (
       <div className={ "grid grid-cols-1 w-110 flex flex-col gap-8 p-5"}>
           {
               posts.map((post)=><Post key={post._id} post={post}/>)
           }
       </div>
    );
};

export default Posts;
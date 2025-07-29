import React from 'react';
import Post from "@/components/Post.jsx";
import {useSelector} from "react-redux";

const Posts = () => {
    const {posts}=useSelector((state)=>state.post);
    return (
       <div>
           {
               posts.map((post)=><Post key={post._id} post={post}/>)
           }
       </div>
    );
};

export default Posts;
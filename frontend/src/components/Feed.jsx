import React from 'react';
import Posts from "@/components/Posts.jsx";

const Feed = () => {
    return (
       <div className='flex-1 my-8 flex flex-col items-center pl-[20%] overflow-hidden'>
           <Posts/>
       </div>
    );
};

export default Feed;
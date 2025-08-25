import React, {useEffect} from 'react';
import {Outlet} from "react-router-dom";
import Feed from "@/components/Feed.jsx";
import RightSidebar from "@/components/RightSidebar.jsx";
import {useGetAllPost} from "@/hooks/useGetAllPost.jsx";
import useGetSuggestedUser from "@/hooks/useGetSuggestedUser.jsx";

const Home = () => {

    useGetAllPost();
    useGetSuggestedUser();

    return (
       <div className='flex'>
           <div className="flex-grow ">
                <Feed/>
                <Outlet/>
           </div>
           <div className="hidden lg:block lg:h-screen">
               <RightSidebar/>
           </div>
           {/*<RightSidebar/>*/}
       </div>
    );
};

export default Home;
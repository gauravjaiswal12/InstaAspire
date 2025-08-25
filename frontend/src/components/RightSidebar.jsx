import React from 'react';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.jsx";
import {Badge} from "@/components/ui/badge.jsx";
import {useSelector} from "react-redux";
import {NavLink} from "react-router-dom";
import SuggestedUsers from "@/components/SuggestedUsers.jsx";

const RightSidebar = () => {
    const {user}=useSelector((state)=>state.auth);

    return (
       <div className='w-fit pt-10 pr-10 relative pl-4 bg-gray-50 h-screen overflow-y-auto'>
           <div className='absolute left-0 top-0 bottom-0 w-[0.75px] bg-gray-50 rounded-full' >  </div>
           <div className='flex items-center gap-6'>
               <NavLink to={`/profile/${user?._id}`}>
                   <Avatar className="hover:scale-150 transition-all duration-300">
                       <AvatarImage src={user?.profilePicture} alt="post_image" className="hover:scale-150 transition-all duration-300"/>
                       <AvatarFallback>CN</AvatarFallback>
                   </Avatar>
               </NavLink>
               <div>
                   <h1 className="font-semibold text-sm hover:text-gray-500 transition-all duration-300"><NavLink to={`/profile/${user?._id}`}>{user?.username}</NavLink></h1>
                   <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here...'}</span>
               </div>
           </div>
           <div className="w-full h-[0.5px] bg-gray-300 mt-6"></div>
           <SuggestedUsers/>
       </div>
    );
};

export default RightSidebar;
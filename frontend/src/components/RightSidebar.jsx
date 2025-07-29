import React from 'react';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.jsx";
import {Badge} from "@/components/ui/badge.jsx";
import {useSelector} from "react-redux";
import {NavLink} from "react-router-dom";
import SuggestedUsers from "@/components/SuggestedUsers.jsx";

const RightSidebar = () => {
    const {user}=useSelector((state)=>state.auth);

    return (
       <div className='w-fit my-10 pr-32'>
           <div className='flex items-center gap-2'>
               <NavLink to={`/profile/${user?._id}`}>
                   <Avatar>
                       <AvatarImage src={user?.profilePicture} alt="post_image"/>
                       <AvatarFallback>CN</AvatarFallback>
                   </Avatar>
               </NavLink>
               <div>
                   <h1 className="font-semibold text-sm"><NavLink to={`/profile/${user?._id}`}>{user?.username}</NavLink></h1>
                   <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here...'}</span>
               </div>

           </div>
           <SuggestedUsers/>
       </div>
    );
};

export default RightSidebar;
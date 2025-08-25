import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {NavLink} from "react-router-dom";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.jsx";
import {followUser} from "@/redux/authSlice.js";

const SuggestedUsers = () => {
    const {suggestedUsers}=useSelector((state)=>state.auth);
    const dispatch=useDispatch();
    console.log("printng the suggested users",suggestedUsers)
    const handleFollow=(id)=>{
        dispatch(followUser(id));
    }
  return (
    <div className='my-5'>
        <div className='flex items-center justify-between text-sm' >
            <h1 className='font-semibold text-gray-600'>Suggested Users</h1>
            <span className='font-medium cursor-pointer'>See all</span>
        </div>
        {
            suggestedUsers?.map((user)=>{
                return (
                    <div key={user._id} className='flex items-center justify-between my-5'>
                        <div className='flex items-center gap-2'>
                            <NavLink to={`/profile/${user?._id}`}>
                                <Avatar>
                                    <AvatarImage src={user?.profilePicture} alt="post_image"/>
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </NavLink>
                            <div>
                                <h1 className="font-semibold text-sm"><NavLink to={`/profile/${user?._id}`}>{user?.username}</NavLink></h1>
                                {
                                    user?.bio && <span className='text-grey-600 text-sm'>{user?.bio || 'Bio here...'}</span>
                                }
                            </div>
                        </div>
                        <span className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]' onClick={()=>handleFollow(user?._id)}>Follow</span>
                    </div>
                )
            })
        }

     </div>
  );
};

export default SuggestedUsers;

import React from 'react';
import {Avatar, AvatarImage,AvatarFallback} from "@/components/ui/avatar.jsx";
import {Button} from "@/components/ui/button.jsx";
import {NavLink} from "react-router-dom";
import {useSelector} from "react-redux";
import useGetAllMessages from "@/hooks/useGetAllMessages.jsx";
import useGetRTM from "@/hooks/useGetRTM.jsx";

const Messages = ({selectedUser}) => {
    useGetAllMessages();
    useGetRTM();
    const {messages}=useSelector((state)=>state.chat);
    const {user}=useSelector((state)=>state.auth);

   return (
     <div className="overflow-y-auto flex-1 p-4">
        <div className="flex justify-center">
            <div className="flex flex-col justify-center items-center">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedUser?.profilePicture} alt="post_image"/>
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span>{selectedUser?.username}</span>
                <NavLink to={`/profile/${selectedUser?._id}`}><Button className="h-8 my-2" variant="secondary">View Profile</Button></NavLink>
            </div>
        </div>
        <div className="flex flex-col gap-3">
            {
                messages && messages.map((message)=>{
                    return (
                        <div key={message._id} className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-2 rounded-lg max-w-xs break-words ${message.senderId === user?._id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                                {message.message}
                            </div>
                        </div>
                    )
                })
            }

        </div>
      </div>
   );
};

export default Messages;

import React, {useState} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {NavLink} from "react-router-dom";
import {MoreHorizontal} from "lucide-react";
import {Button} from "@/components/ui/button.jsx";
import {useDispatch, useSelector} from "react-redux";
import Comment from "@/components/Comment.jsx";
import axios from "axios";
import {setPosts, setSelectedPost} from "@/redux/postSlice.js";
import {toast} from "sonner";

const CommentDialog = ({open,setOpen}) => {
    const [text,setText]=useState('');
    const {selectedPost,posts}=useSelector((state)=>state.post);
    const dispatch=useDispatch();
    const [comment,setComment]=useState(selectedPost?.comments);


    const changeEventHandler=(event)=>{
        const inputText=event.target.value;
        if(inputText.trim()){
            setText(inputText);
        }else{
            setText('');
        }
    }
    const sendMessageHandler=async ()=>{
        try{
            const res=await axios.post(`http://localhost:8000/api/v1/post/${selectedPost._id}/comment`,{comment:text},
                {withCredentials:true});
            console.log("printing res data",res.data);
            if(res.data.success){
                const updatedCommentData=[...comment,res.data.comment];
                setComment(updatedCommentData);
                const updatedPostData=posts.map(p=>p._id===selectedPost._id ? {...p,comments:updatedCommentData} : p);
                dispatch(setPosts(updatedPostData));
                dispatch(setSelectedPost({...selectedPost,comments:updatedCommentData}));
                toast.success(res.data.message);
                setText("");
            }
        }catch (e) {
            console.log(e);
        }
    }


    return (
       <Dialog open={open}>
           {/*set selected post is done null when clicked outside*/}
           <DialogContent onInteractOutside={()=>{setSelectedPost(null)
               setOpen(false)}} className='max-w-5xl p-0 flex flex-col '>
               <DialogHeader>
                   <DialogTitle className="sr-only">Options</DialogTitle>
               </DialogHeader>
               <div className='flex flex-1'>
                   <div className='w-1/2'>
                       <img src={selectedPost?.image} alt="post_img" className='w-full h-full object-cover rounded-l-lg'/>
                   </div>

                   <div className='w-1/2 flex flex-col justify-between'>
                       <div className='flex items-center justify-between p-4'>
                           <div className='flex gap-3 items-center'>
                               <NavLink to='/'>
                                   <Avatar>
                                       <AvatarImage src={selectedPost?.author?.profilePicture} alt="post_image"/>
                                       <AvatarFallback>CN</AvatarFallback>
                                   </Avatar>
                               </NavLink>
                               <div>
                                   <NavLink to='/' className='font-semibold text-xs'>
                                       {
                                           selectedPost?.author?.username
                                       }
                                   </NavLink>
                                   {/*<span className='text-gray-600 text-sm'>Bio here...</span>*/}
                               </div>
                           </div>
                           <Dialog>
                               <DialogTrigger asChild>
                                   <MoreHorizontal className='cursor-pointer'/>
                               </DialogTrigger>
                               <DialogContent className='flex flex-col items-center text-sm text-center'>
                                   <div className='cursor-pointer w-full text-[#ED4956] font-bold'>
                                       Unfollow
                                   </div>
                                   <div className='cursor-pointer w-full'>
                                       Add to favorites
                                   </div>
                               </DialogContent>
                           </Dialog>
                       </div>
                       <hr/>
                       <div className='flex-1 overflow-auto max-h-96 p-4'>
                           {
                               selectedPost?.comments.map((comment)=><Comment key={comment._id} comment={comment}/>)
                           }
                       </div>
                       <div className='p-4'>
                           <div className='flex items-center gap-2'>
                               <input type='text' value={text} onChange={changeEventHandler} placeholder='Add a comment...' className='outline-none w-full text-sm border border-gray-300 rounded p-2'/>
                               <Button disabled={!text.trim()} variant='outline' onClick={sendMessageHandler}>Send</Button>
                           </div>
                       </div>
                   </div>
               </div>

           </DialogContent>
       </Dialog>
    );
};

export default CommentDialog;
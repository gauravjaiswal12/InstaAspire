import React, {useEffect, useState} from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog,DialogContent,DialogTrigger } from "@/components/ui/dialog"
import {Bookmark, MessageCircle, MoreHorizontal, Send} from "lucide-react";
import {Button} from "@/components/ui/button.jsx";
import {FaHeart, FaRegHeart} from "react-icons/fa";
import CommentDialog from "@/components/CommentDialog.jsx";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import axios from "axios";
import {setPosts, setSelectedPost} from "@/redux/postSlice.js";
import {Badge} from "@/components/ui/badge.jsx";
import VideoPlayer from "@/services/videoPlayer/hls.jsx";

const Post = ({post}) => {
    const [text,setText]=useState('');
    const [open,setOpen]=useState(false);
    const {user}=useSelector((state)=>state.auth);
    const {posts}=useSelector((state)=>state.post);
    const dispatch=useDispatch();
    const [liked,setLiked]=useState(post.likes.includes(user?._id) || false);
    const [postLike,setPostLike]=useState(post.likes.length);
    const [comment,setComment]=useState(post.comments);

    useEffect(() => {
        setComment(post.comments);
    }, [setPosts]);

    const changeEventHandler=(event)=>{
        const inputText=event.target.value;
        if(inputText.trim()){
            setText(inputText);
        }else{
            setText('');
        }
    }

    const bookmarkHandler=async ()=>{
        try{
            const res=await axios.get(`http://localhost:8000/api/v1/post/${post?._id}/bookmark`,{withCredentials:true});
            if(res.data.success){
                toast.success(res.data.message);
            }
        }catch (e) {
            console.log(e);
        }
    }

    const likeOrDislikeHandler=async ()=>{
        try{
            const action=liked? 'dislike' : 'like';
            const res=await axios.post(`http://localhost:8000/api/v1/post/${post._id}/${action}`,{},{withCredentials:true});
            if(res.data.success){
                const updatedLikes=liked ? postLike-1 : postLike+1;
                setPostLike(updatedLikes);
                toast.success(res.data.message);
                setLiked(!liked);
                //apne post ko update karenge
                const updatedPost=posts.map(p=>p._id===post._id ?
                    {
                        ...p,
                        //done so since we have changed like variable using set function
                        likes: liked ? p.likes.filter(l=>l!==user?._id) : [...p.likes,user?._id]
                    } : p);
                dispatch(setPosts(updatedPost));
            }
        }catch (e) {
            console.log(e);
            toast.error(e.response.data.message);
        }
    }

    const deletePostHandler=async ()=>{
        try{
            const res=await axios.delete(`http://localhost:8000/api/v1/post/delete/${post._id}`,{withCredentials:true});
            if(res.data.success){
                const updatedPosts=posts.filter(p=>p._id!==post._id);
                dispatch(setPosts(updatedPosts));
                toast.success(res.data.message);
                setOpen(false);
            }
        }catch (e) {
            console.log(e);
            toast.error(e.response.data.message);
        }
    }

    const commentHandler=async ()=>{
        try{
            console.log("printing text",text);
            const res=await axios.post(`http://localhost:8000/api/v1/post/${post._id}/comment`,{comment:text},
                {withCredentials:true});
            if(res.data.success){
                const updatedCommentData=[...comment,res.data.comment];
                setComment(updatedCommentData);
                const updatedPostData=posts.map(p=>p._id===post._id ? {...p,comments:updatedCommentData} : p);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        }catch (e) {
            console.log(e);
        }
    }

    return (
        <div className='my-8 w-full max-w-sm mx-auto '>
            <div className='flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                    <Avatar>
                        <AvatarImage src={post.author?.profilePicture} alt="post_image"/>
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-3'>
                        <h1>{post.author?.username}</h1>
                        {
                            user?._id===post.author._id &&  <Badge variant="secondary">Author</Badge>
                        }

                    </div>

                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer'/>
                    </DialogTrigger>
                    <DialogContent  className='flex flex-col items-center text-sm text-center'>
                        {
                            post.author?._id!==user?._id &&  <Button variant='ghost' className='cursor-pointer w-fit text-[#ED4956] font-bold'>Unfollow</Button>
                        }

                        <Button variant='ghost' className='cursor-pointer w-fit'>Add to favorites</Button>
                        {
                            user && user._id===post.author._id && <Button onClick={deletePostHandler} variant='ghost' className='cursor-pointer w-fit'>Delete</Button>
                        }

                    </DialogContent>
                </Dialog>
            </div>
            <div className="rounded-sm my-2 w-full aspect-square">
                {post.mediaType === "video" ? (
                         <VideoPlayer src={post.mediaUrl?.hls || post.mediaUrl} />

                ) : (
                    <img
                        className="w-full h-full object-cover rounded-sm"
                        src={post.mediaUrl}
                        alt="post_image"
                    />
                )}
            </div>



            <div className='flex items-center justify-between my-2'>
                <div className='flex items-center gap-3 '>
                    {
                        liked ? <FaHeart onClick={likeOrDislikeHandler} size='22px' className='cursor-pointer text-red-600'/> : <FaRegHeart onClick={likeOrDislikeHandler} size='22px' className='cursor-pointer hover:text-gray-600'/>
                    }

                    <MessageCircle onClick={()=>{
                        dispatch(setSelectedPost(post))
                        setOpen(true)}} className='cursor-pointer hover:text-gray-600'/>
                    <Send className='cursor-pointer hover:text-gray-600'/>
                </div>
                <Bookmark onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-600'/>
            </div>
            <span className='font-medium block mb2'>{postLike} likes</span>
            <p>
                <span className='font-medium mr-2'>{post.author?.username}</span>
                {post.caption}
            </p>
            <span onClick={()=>{
                dispatch(setSelectedPost(post))
                setOpen(true)}} className='cursor-pointer text-sm text-gray-400'>
               {/*it is not updating in real time*/}
                {post.comments.length? `View all ${post.comments.length} comments` : `No comments Yet`}
           </span>
            <CommentDialog open={open} setOpen={setOpen}/>
            <div className='flex items-center justify-between'>
                <input type='text'  placeholder='Add a comment...' value={text} onChange={changeEventHandler} className='outline-none text-sm w-full'/>
                {
                    text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>
                }

            </div>


        </div>
    );
};

export default Post;
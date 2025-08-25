import React, {useState} from 'react';
import {ClapperboardIcon, Heart, Home, LogOut, MessageCircleIcon, PlusSquare, Search, TrendingUp} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {toast} from "sonner";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {setAuthUser, setSelectedUser} from "@/redux/authSlice.js";
import CreatePost from "@/components/CreatePost.jsx";
import {setPosts, setSelectedPost} from "@/redux/postSlice.js";
import {Button} from "@/components/ui/button.jsx";
import {clearLikeNotification} from "@/redux/rtnSlice.js";
import {clearMsgNotification} from "@/redux/chatSlice.js";
import CreateReels from "@/components/CreateReels.jsx";
import PixelVerseLogo from "./PixelVerseLogo.jsx"

const LeftSidebar = () => {
    const navigate=useNavigate();
    const {user}=useSelector((state)=>state.auth);
    const dispatch=useDispatch();
    const [open,setOpen]=useState(false);
    const [openCreatePost,setOpenCreatePost]=useState(false);
    const [openCreateReels,setOpenCreateReels]=useState(false);
    //use to control the open of notification
    const [openNotification,setOpenNotification]=useState(false);
    //use to control the open of message
    const [openMsgNotification,setOpenMsgNotification]=useState(false);
    const {likeNotification}=useSelector((state)=>state.realTimeNotification);
    const {messageNotification}=useSelector((state)=>state.chat);

    console.log("printing MSG notification inside Leftside bar",messageNotification);


    const logoutHandler=async ()=>{
        try{
            const res=await axios.post('http://localhost:8000/api/v1/user/logout',{withCredentials:true});
            if(res.data.success){
                toast.success(res.data.message);
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setSelectedUser(null));
                dispatch(setPosts([]));
                navigate('/login');

            }
        }catch (e) {
            console.log(e);
            toast.error(e.response.data.message);
        }
    }
    const sidebarHandler=(text)=>{
        if(text==='Logout'){
            logoutHandler();
        }else if(text==='Create'){
           setOpen(true);
        }else if(text==='Profile'){
            navigate('/profile/'+user?._id);
        }else if(text==='Home'){
            navigate('/');
        }else if(text==='Messages'){
            navigate('/chat');
        }else if(text==='Reels'){
            navigate('/viewReels');
        }else if(text==='Search'){
            navigate('/search');
        }
    }

    const sidebarItems = [
        { icon:<Home/>, text:'Home'},
        { icon:<Search/>, text:'Search'},
        { icon:<TrendingUp/>, text:'Trending'},
        { icon:<ClapperboardIcon/>, text:'Reels'},
        { icon:<MessageCircleIcon/>, text:'Messages'},
        { icon:<Heart/>, text:'Notifications'},
        { icon:<PlusSquare/>, text:'Create'},
        { icon:(
               <Avatar className='w-6 h-6'>
                   <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                   <AvatarFallback>CN</AvatarFallback>
               </Avatar>
            ), text:'Profile'},
        { icon:<LogOut/>, text:'Logout'},

    ]
    console.log("printing the user",{user});
    const handleOpenChange=(newState)=>{
        setOpenNotification(newState);
        if(!newState){
            console.log("printing like notification",likeNotification);
            dispatch(clearLikeNotification());
            console.log("printing like notification after",likeNotification);
        }

    }
    const handleOpenMsgNotification=(newState)=>{
        setOpenMsgNotification(newState);
        if(!newState){
            dispatch(clearMsgNotification());
        }
    }
    const togglePost=()=>{
        setOpenCreatePost(!openCreatePost);
        setOpenCreateReels(false);
        setOpen(false);
    }
    const toggleReels=()=>{
        setOpenCreateReels(!openCreateReels);
        setOpenCreatePost(false);
        setOpen(false);
    }

    return (

       <div className='fixed top-0 z-10 left-0 px-4 pr-4 lg:border-r border-gray-300 lg:w-[16%]  h-screen'>
           <div className='flex flex-col gap-4 py-4'>
               {/*//use instagram logo after*/}
               <h1 className='my-5 pl-3 font-bold text-2xl relative group cursor-pointer select-none'>

                   <span className='relative z-10 bg-gradient-to-r from-blue-700 via-purple-900 to-pink-500 bg-clip-text text-transparent bg-300% animate-gradient-x font-extrabold tracking-wide drop-shadow-lg hover:scale-110 transition-all duration-300'>
                        <span>
                            <PixelVerseLogo className={"w-10 h-15 hover:scale-105 transition-transform duration-300"}/>
                        </span>
                       PIXEL-VERSE
                   </span>
               </h1>
               <div>
                   {
                       sidebarItems.map((item,index)=>(
                          <div key={index} onClick={()=>sidebarHandler(item.text)} className='flex items-center relative hover:bg-gray-300 hover:scale-110 transition-all duration-300 cursor-pointer rounded-lg p-3 gap-3 my-3'>
                              <span className="hidden md:inline">{item.icon}</span>

                              <span>{item.text}</span>
                              {
                                  item.text==='Notifications' && likeNotification?.length>0 && (
                                      <Popover open={openNotification} onOpenChange={handleOpenChange}>
                                          <PopoverTrigger asChild>
                                                  <Button variant={"ghost"} size='icon' className="rounded-full h-5 text-white w-5 bg-red-600 absolute hover:bg-red-600 bottom-6 left-6">{likeNotification.length}</Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="bg-white">
                                              <div>
                                                  {
                                                        likeNotification.length===0 ? (<p>No new Notification</p>) : (
                                                            likeNotification.map((notification)=>{
                                                                return (
                                                                    <div key={notification.userId} className="flex items-center gap-2 my-2" >
                                                                        <Avatar>
                                                                            <AvatarImage src={notification?.userDetails?.profilePicture} alt="post_image"/>
                                                                            <AvatarFallback>CN</AvatarFallback>
                                                                        </Avatar>
                                                                        <p className='text-sm'><span className="font-bold">{notification?.userDetails?.username} </span>Liked your post</p>
                                                                    </div>
                                                                )
                                                            })
                                                        )
                                                  }
                                              </div>
                                          </PopoverContent>
                                      </Popover>
                                  )
                              }
                              {
                                  item.text==='Messages' && messageNotification?.length>0 && (
                                      <Popover open={openMsgNotification} onOpenChange={handleOpenMsgNotification}>
                                          <PopoverTrigger asChild>
                                              <Button variant={"ghost"} size='icon' className="rounded-full h-5 text-white w-5 bg-red-600 absolute hover:bg-red-600 bottom-6 left-6">{messageNotification.length}</Button>
                                          </PopoverTrigger>
                                      </Popover>
                                  )
                              }
                              {
                                  item.text==='Create'&& (
                                      <Popover open={open} onOpenChange={setOpen} >
                                          <PopoverTrigger asChild><span>+</span>
                                          </PopoverTrigger>
                                          <PopoverContent  style={{ width: 'fit-content' }} className="text-black flex flex-col items-center  justify-center gap-2 mx-auto ml-50 -mt-[90px]">
                                              <Button variant={"ghost"} onClick={togglePost} className="text-black bg-pink-100 hover:bg-pink-300 transition-colors active:outline-black">Create Post</Button>
                                              <Button variant={"ghost"} onClick={toggleReels} className="text-black bg-pink-100 hover:bg-pink-300 transition-colors active:outline-black">Create Reels</Button>
                                          </PopoverContent>
                                      </Popover>

                                  )
                              }
                          </div>

                       ))
                   }
               </div>

           </div>

           <CreatePost open={openCreatePost} setOpen={setOpenCreatePost}/>
           <CreateReels open={openCreateReels} setOpen={setOpenCreateReels}/>

       </div>
    );
};

export default LeftSidebar;
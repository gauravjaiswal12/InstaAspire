import React, {useRef, useState} from 'react';

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.jsx";
import {useDispatch, useSelector} from "react-redux";
import {Button} from "@/components/ui/button.jsx";
import {Textarea} from "@/components/ui/textarea.jsx";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectGroup,SelectLabel,SelectItem} from "@/components/ui/select.jsx";
import axios from "axios";
import {Loader2} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {readFileAsDataURL} from "@/lib/utils.js";
import {setAuthUser, setUserProfile} from "@/redux/authSlice.js";
import {toast} from "sonner";

const EditProfile = () => {
    const {user}=useSelector((state)=>state.auth);
    const [loading,setLoading]=useState(false);
    const [input,setInput]=useState({
        profilePhoto:user?.profilePicture,
        bio:user?.bio,
        gender:user?.gender,
    });
    const navigate=useNavigate();
    const dispatch=useDispatch();

    const imageRef=useRef();

    const fileChangeHandler=async (e)=>{
        const file=e.target.files?.[0];
        if(file){
            setInput(prevState => {
                return {
                    ...prevState,
                    profilePhoto:file
                }
            })
        }
    }
    const selectChangeHandler=(value)=>{
        setInput({...input,gender:value})
    }
    const editProfileHandler=async ()=>{
        console.log(input);
        const formData=new FormData();
        formData.append("bio",input.bio);
        formData.append("gender",input.gender);
        if(input.profilePhoto){
            formData.append("profilePicture",input.profilePhoto);
        }
        try{
            setLoading(true);
            const res=await axios.post('http://localhost:8000/api/v1/user/Profile/edit',formData,{
                headers:{
                    'Content-Type':'multipart/form-data'
                },
                withCredentials:true
            });
            if(res.data.success){
                const updatedUserData={
                    ...user,
                    bio:res.data.user?.bio,
                    gender:res.data.user?.gender,
                    profilePicture:res.data.user?.profilePicture
                }
                dispatch(setAuthUser(updatedUserData));
                toast.success(res.data.message);
                navigate(`/profile/${user?._id}`);
            }
            setLoading(false);
        }catch (e) {
            console.log(e);
            toast.error(e.response.data.message);
            setLoading(false);
        }
    }
    return (
        <div className='flex max-w-2xl mx-auto pl-10 '>
            <section className='flex flex-col gap-6 w-full my-8'>
                <h1 className='font-bold text-xl'>
                    Edit Profile
                </h1>
                    <div className='flex items-center justify-between bg-gray-100 rounded-xl p-4'>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                {/*<AvatarImage src={user?.profilePicture} alt="post_image"/>*/}
                                <AvatarImage
                                    src={
                                        input.profilePhoto instanceof File
                                            ? URL.createObjectURL(input.profilePhoto)
                                            : input.profilePhoto
                                    }
                                    alt="profile"
                                />

                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="font-bold text-sm">{user?.username}</h1>
                                <span className='text-gray-600'>{user?.bio || 'Bio here...'}</span>
                            </div>
                        </div>
                        <input ref={imageRef} onChange={fileChangeHandler} type="file" className='hidden'/>
                        <Button onClick={()=>imageRef.current.click()} variant="ghost" className="bg-[#0095F6] h-8 hover:bg-[#318bc7">Change Photo</Button>
                    </div>
                    <div>
                        <h1 className='font-bold text-xl mb-2'>Bio</h1>
                        <Textarea value={input.bio} onChange={(e)=>setInput({...input,bio:e.target.value})} name='bio' className="focus-visible:ring-transparent " placeholder="Write a bio..."/>
                    </div>
                    <div>
                        <h1 className="font-bold mb-2">Gender</h1>
                        <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end">
                        {
                            loading ? (
                                <Button variant="ghost" className='w-fit bg-[#0095F6] hover:bg-[#2a8ccd]'>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                                    Please wait...
                                </Button>):( <Button onClick={editProfileHandler} variant="ghost" className='w-fit bg-[#0095F6] hover:bg-[#2a8ccd]'>Submit</Button>)
                        }

                    </div>
            </section>
         </div>
      );
};

export default EditProfile;

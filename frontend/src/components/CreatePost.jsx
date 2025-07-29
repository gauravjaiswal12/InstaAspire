import React, {useRef, useState} from 'react';
import {Dialog, DialogContent, DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog.jsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.jsx";
import {Textarea} from "@/components/ui/textarea.jsx";
import {Button} from "@/components/ui/button.jsx";
import {readFileAsDataURL} from "@/lib/utils.js";
import {Loader2} from "lucide-react";
import {toast} from "sonner";
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import {setPosts} from "@/redux/postSlice.js";

const CreatePost = ({open,setOpen}) => {
    const imageRef=useRef();
    const [file,setFile]=useState("");
    const [caption,setCaption]=useState("");
    const [imagePreview,setImagePreview]=useState("");
    const [loading,setLoading]=useState(false);
    const [mediaType,setMediaType]=useState("");
    const {user}=useSelector((state)=>state.auth);
    const {posts}=useSelector((state)=>state.post);
    const dispatch=useDispatch();


    const fileChangeHandler = async (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        const dataUrl = await readFileAsDataURL(selectedFile);
        setImagePreview(dataUrl);

        // detect media type
        if (selectedFile.type.startsWith("video")) {
            setMediaType("video");
        } else if (selectedFile.type.startsWith("image")) {
            setMediaType("image");
        } else {
            toast.error("Unsupported file type");
            setMediaType("");
        }
    };

    const createPostHandler = async () => {
        const formData = new FormData();
        formData.append("caption", caption);
        if (file) formData.append("media", file); // <-- always use "media"
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:8000/api/v1/post/addPost", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });

            if (res.data.success) {
                dispatch(setPosts([res.data.post, ...posts]));
                toast.success(res.data.message);
                setOpen(false);
                setFile("");
                setCaption("");
                setImagePreview("");
                setMediaType(""); // clear this too
            }
            setLoading(false);
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to create post");
            console.log("error while creating post: ", e);
            setLoading(false);
        }
    };


    return (
        <Dialog open={open}>
            <DialogContent onInteractOutside={()=>setOpen(false)}>
                <DialogHeader>
                    <DialogTitle className='text-center font-semibold'>
                        Create New Post
                    </DialogTitle>
                    <DialogDescription className='text-xs text-center text-gray-500'>
                        Upload a photo or video     and write a caption.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-3 items-center">
                    <Avatar>
                        <AvatarImage src={user?.profilePicture} alt="post_image"/>
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className='font-semibold text-xs'>{user?.username}</h1>
                        <span className='text-gray-600 text-xs'>Bio here...</span>
                    </div>
                </div>
                <Textarea value={caption} onChange={(e)=>setCaption(e.target.value)} className="focus-visible:ring-transparent border-none" placeholder="Write a caption..."/>

                {imagePreview && (
                    <div className='w-full h-64 flex items-center justify-center'>
                        {mediaType === "video" ? (
                            <video
                                src={imagePreview}
                                controls
                                className='object-cover w-full h-full rounded-md'
                            />
                        ) : (
                            <img
                                src={imagePreview}
                                alt="Selected"
                                className='object-cover w-full h-full rounded-md'
                            />
                        )}
                    </div>
                )}

                <input ref={imageRef} type="file" className='hidden' onChange={fileChangeHandler}/>
                <Button onClick={()=>imageRef.current.click()} variant={'ghost'} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]'>Select from computer</Button>
                {
                    imagePreview && (
                        loading ? (
                            <Button>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                                Please wait...
                            </Button>
                        ):(
                            <Button type='submit' onClick={createPostHandler} className='w-full'>Post</Button>
                        )
                    )
                }
            </DialogContent>
        </Dialog>
    );
};

export default CreatePost;
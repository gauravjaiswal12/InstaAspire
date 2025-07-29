import React, {useRef, useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog.jsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.jsx";
import {Textarea} from "@/components/ui/textarea.jsx";
import {Button} from "@/components/ui/button.jsx";
import {Loader2} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {readFileAsDataURL} from "@/lib/utils.js";
import {toast} from "sonner";

import {createReel} from "@/redux/reelSlice.js";


const CreateReels = ({open,setOpen}) => {
    const videoRef=useRef();
    const audioRef=useRef();
    const [videoFile,setVideoFile]=useState("");
    const [audioFile,setAudioFile]=useState("");
    const [caption,setCaption]=useState("");
    const [videoPreview,setVideoPreview]=useState("");
    const [audioPreview,setAudioPreview]=useState("");
    const [loading,setLoading]=useState(false);
    const {user}=useSelector((state)=>state.auth);
    const dispatch=useDispatch();


    const fileChangeHandler = async (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setVideoFile(selectedFile);
        const dataUrl = await readFileAsDataURL(selectedFile);
        setVideoPreview(dataUrl);

        // detect media type
        if (!selectedFile.type.startsWith("video")) {
            toast.error("Unsupported file type");
        }
    };
    const audioChangeHandler = async (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setAudioFile(selectedFile);
        const dataUrl=await readFileAsDataURL(selectedFile);
        setAudioPreview(dataUrl);

        if(!selectedFile.type.startsWith("audio")){
            toast.error("Unsupported file type");
        }
    }

    // In CreateReels.jsx

    const createReelHandler = async () => {
        // The handler must now be async
        const formData = new FormData();
        formData.append("caption", caption);
        formData.append("videoFile", videoFile);
        formData.append("audioFile", audioFile);

        setLoading(true); // Still useful to disable the button

        try {
            // 1. Dispatch the thunk and await its unwrapped result
            const resultAction = await dispatch(createReel(formData)).unwrap();

            // 2. If it succeeds, this code will run
            toast.success("Reel created successfully!");
            setOpen(false);
            // Reset your local state here...

        } catch (err) {
            // 3. If it fails, the `unwrap()` will throw an error, and this code will run
            toast.error(err.message || "Failed to create reel.");
            console.error("Failed to create reel:", err);

        } finally {
            // 4. This runs regardless of success or failure
            setLoading(false);
        }
    };
    return (
        <Dialog open={open}>
            <DialogContent onInteractOutside={()=>setOpen(false)}>
                <DialogHeader>
                    <DialogTitle className='text-center font-semibold'>
                        Create New Reels
                    </DialogTitle>
                    <DialogDescription className='text-xs text-center text-gray-500'>
                        Upload a video and write a caption.
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

                {videoPreview && (
                    <div className='w-full h-64 flex items-center justify-center'>
                            <video
                                src={videoPreview}
                                controls
                                className='object-cover w-full h-full rounded-md'
                            />
                    </div>
                )}
                {audioPreview && (
                    <div className='w-full h-14 flex items-center justify-center'>
                        <audio src={audioPreview} controls className='object-cover w-full h-full rounded-md'/>
                    </div>
                )}
                <div className="flex flex-col items-center justify-center gap-5">
                    <input ref={videoRef} type="file" className='hidden' onChange={fileChangeHandler}/>
                    <Button onClick={()=>videoRef.current.click()} variant={'ghost'} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]'>Select from computer</Button>
                    <input ref={audioRef} type="file" className='hidden' onChange={audioChangeHandler}/>
                    <Button onClick={()=>audioRef.current.click()} variant={'ghost'} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]'>Select any Audio to put</Button>
                </div>

                {
                    videoPreview && (
                        loading ? (
                            <Button>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                                Please wait...
                            </Button>
                        ):(
                            <Button type='submit' onClick={createReelHandler} className='w-full'>Create Reels</Button>
                        )
                    )
                }
            </DialogContent>
        </Dialog>
    );
};

export default CreateReels;

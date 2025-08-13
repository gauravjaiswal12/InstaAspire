import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog.jsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import {MoreHorizontal, Send} from 'lucide-react';
import { toast } from "sonner";
import {NavLink} from "react-router-dom";
import Comment from "@/components/Comment.jsx";
import VideoPlayer from "@/services/videoPlayer/hls.jsx";
import {commentOnReel} from "@/redux/reelSlice.js";

// This component will handle everything related to comments for a reel.
const CommentsDialog = ({ src,reel,reelId, open, onOpenChange }) => {
    const dispatch = useDispatch();
    const [comment,setComment]=useState('');
    const [loading, setLoading] = useState(false); // Add loading state

    const handlePostComment = async () => {
        // Guard clause to prevent empty comments
        if (!comment.trim()) return;

        setLoading(true);
        try {
            // Use the .unwrap() pattern to handle success and error
            await dispatch(commentOnReel({ reelId: reelId, comment: comment.trim() })).unwrap();
            setComment('');
        } catch (err) {
            console.error("Failed to post comment:", err);
            toast.error(err.message || "Could not post comment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/*set selected post is done null when clicked outside*/}
            <DialogContent className='max-w-5xl p-0 flex flex-col '>
                <DialogHeader>
                     <DialogTitle className="text-center">Comments</DialogTitle>
                </DialogHeader>
                <div className='flex flex-1'>
                    <div className='w-1/2'>
                        <VideoPlayer src={src} />
                    </div>

                    <div className='w-1/2 flex flex-col justify-between'>
                        <div className='flex items-center justify-between p-4'>
                            <div className='flex gap-3 items-center'>
                                <NavLink to='/'>
                                    <Avatar>
                                        <AvatarImage src={reel?.author?.profilePicture} alt="post_image"/>
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </NavLink>
                                <div>
                                    <NavLink to={`${reel?.author?._id}/profile`} className='font-semibold text-xs'>
                                        {
                                            reel?.author?.username
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
                                    <DialogHeader>
                                        <DialogTitle className="sr-only">Options</DialogTitle>
                                    </DialogHeader>
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
                                reel?.comments.map((comment)=><Comment key={comment._id} comment={comment}/>)
                            }
                        </div>
                        <div className='p-4'>
                            <div className='flex items-center gap-2'>
                                <input type='text' value={comment} onChange={(e) => setComment(e.target.value)} placeholder='Add a comment...' className='outline-none w-full text-sm border border-gray-300 rounded p-2'/>
                                <Button
                                    disabled={!comment.trim() || loading}
                                    onClick={handlePostComment}
                                >
                                    {loading ? "Posting..." : "Post"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default CommentsDialog;

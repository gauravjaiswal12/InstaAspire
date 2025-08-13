// src/components/ReelCard.js

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markReelAsViewed, likeReel, unlikeReel } from '../redux/reelSlice';
import VideoPlayer from "@/services/videoPlayer/hls.jsx";
import {Heart, MessageCircle, Send} from "lucide-react";
import {Dialog} from "@/components/ui/dialog.jsx";
import CommentsDialog from "@/components/CommentsDialog.jsx";

function ReelCard({ reel }) {
    const dispatch = useDispatch();
    const cardRef = useRef(null); // Ref for the whole card
    const viewTimerRef = useRef(null);
    const [hasBeenMarked, setHasBeenMarked] = useState(false);
    const [showComments, setShowComments] = useState(false);

    // Get the logged-in user's ID to handle likes correctly
    const { user } = useSelector(state => state.auth);

    // This observer will trigger the `markReelAsViewed` action
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasBeenMarked) {
                        viewTimerRef.current = setTimeout(() => {
                            dispatch(markReelAsViewed(reel._id));
                            setHasBeenMarked(true);
                        }, 2000);
                }else{
                    if (viewTimerRef.current) {
                        clearTimeout(viewTimerRef.current);
                    }
                }
            },
            { threshold: 0.7 } // Trigger when 70% of the reel is visible
        );

        // Capture cardRef.current in a variable to avoid stale closures in the cleanup function.
        const currentCardRef = cardRef.current;
        if (currentCardRef) {
            observer.observe(currentCardRef);
        }

        // Cleanup function for when the component unmounts
        return () => {
            if (currentCardRef) {
                observer.unobserve(currentCardRef);
            }
            // Also clear the timer on unmount, just in case.
            if (viewTimerRef.current) {
                clearTimeout(viewTimerRef.current);
            }
        };
    }, [reel._id, dispatch, hasBeenMarked]);

    const handleLikeToggle = () => {
        if (reel.isLikedByCurrentUser) {
            dispatch(unlikeReel({ reelId: reel._id, userId: user._id }));
        } else {
            dispatch(likeReel({ reelId: reel._id, userId: user._id }));
        }
    };
    const handleCommentClick = (e) => {
        e.stopPropagation(); // Prevent the click from affecting the video player
        setShowComments(true); // Open the dialog
    };

    return (
        <div className="reel-card w-full h-full bg-black rounded-xl overflow-hidden relative shadow-2xl " ref={cardRef}>
            <VideoPlayer src={reel.videoUrl} />

            {/* Gradient overlay for text readability */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>

            {/* --- UI OVERLAY CONTAINER for bottom info --- */}
            <div className="absolute -bottom-5 w-fit h-fit z-40 p-4 flex flex-col ">
                <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <img
                            src={reel.author?.profilePicture}
                            alt={reel.author?.username}
                            className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        />
                        <span className="font-bold text-base drop-shadow-md">{reel.author?.username}</span>
                        <button className="text-xs font-semibold border border-white/50 rounded-md px-3 py-1 hover:bg-white/20 transition-colors">Follow</button>
                    </div>
                    <p className="text-sm font-medium drop-shadow-sm">{reel.caption}</p>
                </div>
            </div>

            {/* --- RIGHT SIDE ACTION BAR --- */}
            {/* This is the new vertical toolbar. It's positioned from the bottom to avoid the player controls. */}
            <div className="absolute w-fit h-fit bottom-24 right-2 z-40 flex flex-col items-center gap-5 p-2 rounded-full bg-black/20 backdrop-blur-sm">
                {/* Like Button */}
                <div className="flex flex-col items-center text-center">
                    <button
                        onClick={handleLikeToggle}
                        className="transform transition-transform active:scale-125"
                        aria-label="Like reel"
                    >
                        <Heart
                            size={32}
                            className="drop-shadow-lg"
                            color={reel.isLikedByCurrentUser ? '#FF3B5C' : '#FFFFFF'}
                            fill={reel.isLikedByCurrentUser ? '#FF3B5C' : 'transparent'}
                        />
                    </button>
                    <span className="text-sm font-bold drop-shadow-md">{reel.likes?.length || 0}</span>
                </div>

                {/* Comment Button */}
                <div className="flex flex-col items-center text-center " >
                    <button onClick={handleCommentClick} className="transform transition-transform active:scale-125" aria-label="View comments">
                        <MessageCircle size={32} color="#FFFFFF" className="drop-shadow-lg" onClick={()=>setShowComments(!showComments)} />
                    </button>
                    <span className="text-sm font-bold drop-shadow-md">{reel.comments?.length || 0}</span>
                </div>

                {/* Share Button */}
                <div className="flex flex-col items-center text-center">
                    <button className="transform transition-transform active:scale-125" aria-label="Share reel">
                        <Send size={32} color="#FFFFFF" className="drop-shadow-lg" />
                    </button>
                </div>
            </div>
            {/* 4. Render the dialog and pass it the state and the reel ID */}
            <CommentsDialog
                src={reel.videoUrl}
                reel={reel}
                reelId={reel._id}
                open={showComments}
                onOpenChange={setShowComments}
            />
        </div>
    );
}

export default ReelCard;
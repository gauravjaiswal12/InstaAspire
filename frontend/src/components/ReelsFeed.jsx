// src/components/ReelsFeed.js

import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedReels, clearFeed } from '../redux/reelSlice';
import ReelCard from './ReelCard.jsx'; // We will create this next


function ReelsFeed() {
    const dispatch = useDispatch();
    const { reels, status, error, currentPage, hasNextPage } = useSelector((state) => state.reel.feed);

    // This ref will be attached to a loader element at the bottom of the list
    const observer = useRef();
    const lastReelElementRef = useCallback(node => {
        if (status === 'loading') return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            // If the loader element is visible and there are more pages, fetch the next page
            if (entries[0].isIntersecting && hasNextPage) {
                dispatch(fetchFeedReels({ page: currentPage }));
            }
        });
        if (node) observer.current.observe(node);
    }, [status, hasNextPage, currentPage, dispatch]);

    // // Fetch initial reels when the component mounts
    // useEffect(() => {
    //     // Only fetch if the feed is empty
    //     if (reels.length === 0) {
    //         dispatch(fetchFeedReels({ page: 1 }));
    //     }
    //
    //     // Cleanup: Clear the feed when the component unmounts
    //     return () => {
    //         dispatch(clearFeed());
    //     };
    // }, [dispatch, reels.length]);
    //
    // if (status === 'failed') return <div>Error: {error}</div>;

    // --- REFACTORED useEffect LOGIC ---

    // Effect for the initial data fetch.
    // This runs only ONCE when the component first mounts.
    useEffect(() => {
        // We clear the feed first to ensure a fresh start,
        // then fetch the first page.
        dispatch(clearFeed());
        dispatch(fetchFeedReels({ page: 1 }));
    }, [dispatch]); // The dependency array only contains dispatch, which is stable.

    if (status === 'failed' && error) return <div>Error: {error}</div>;

    // Handle the case where reels is not yet an array
    if (!Array.isArray(reels)) {
        // You can return a loading spinner or null while the state initializes
        return <div>Loading...</div>;
    }


    return (

            <div className="h-screen overflow-y-scroll scroll-snap-type-y-mandatory">
                {/*{reels && reels.map((reel, index) => {*/}
                {/*    // If this is the last reel, attach the ref to it*/}
                {/*    // Add a safety check here to prevent rendering null items*/}

                {/*    if (reels.length === index + 1) {*/}
                {/*        return (*/}
                {/*            <div ref={lastReelElementRef} key={reel._id} className="h-screen w-full flex items-center justify-center scroll-snap-align-start relative">*/}
                {/*                <ReelCard reel={reel} />*/}
                {/*            </div>*/}
                {/*        );*/}
                {/*    } else {*/}
                {/*        return <ReelCard reel={reel} key={reel._id} className="w-full max-w-md h-[100vh] sm:h-[85vh] relative"/>;*/}
                {/*    }*/}
                {/*})}*/}
                {reels.map((reel, index) => {
                    if (!reel || !reel._id) return null;

                    const isLastReel = reels.length === index + 1;

                    return (
                        // Each of these divs is a "snap point" that fills the screen and centers its content.
                        <div
                            ref={isLastReel ? lastReelElementRef : null}
                            key={reel._id}
                            className="h-screen w-full flex items-center justify-center scroll-snap-align-start relative"
                        >
                            {/* --- THIS IS THE FIX ---
                            This inner div is the container that gives ReelCard its size.
                            It's now constrained to a phone-like aspect ratio and max height.
                        */}
                            <div className="h-full w-full sm:h-[90vh] sm:w-auto aspect-[12/16]">
                                <ReelCard reel={reel} />
                            </div>
                        </div>
                    );
                })}

                {/* Show a loading spinner while fetching the next page */}
                {status === 'loading' && <div>Loading...</div>}
                {!hasNextPage && reels.length > 0 && <p>You've seen it all!</p>}
            </div>


    );
}

export default ReelsFeed;
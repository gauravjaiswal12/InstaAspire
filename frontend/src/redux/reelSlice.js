import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "axios";
// Assume you have an api.js file for making network requests
// import * as api from '../api/reelsAPI';

//================================================================
// 1. ASYNC THUNKS (Connecting to your backend API)
//================================================================

// Fetches the main feed using your /BestReels endpoint with pagination
export const fetchFeedReels = createAsyncThunk(
    'reels/fetchFeed',
    async ({ page }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/v1/reel/BestReels`, {
                params: { page: page, limit: 10 }, // <-- SEND PAGE PARAMETER
                withCredentials: true
            });
            console.log("printing the response for the fetch feed reels", response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Fetches reels for a specific user's profile
export const fetchProfileReels = createAsyncThunk(
    'reels/fetchProfileReels',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/v1/reel/otherUserReels/${userId}`,{withCredentials:true});
            return response.data.reels;
            // return []; // Placeholder
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// In reelSlice.js
//done so that without refresh ui work when user upload the reel
export const createReel = createAsyncThunk(
    'reels/create',
    async (reelFormData, { rejectWithValue }) => {
        try {
            const res = await axios.post("http://localhost:8000/api/v1/reel/createReel", reelFormData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });
            // The API should return the newly created reel object
            console.log("printing the reel data",res.data.data);
            return res.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// This is the KEY to your "no repeats" feature.
// It calls your backend to log that a user has seen a reel.
export const markReelAsViewed = createAsyncThunk(
    'reels/markAsViewed',
    async (reelId, { rejectWithValue }) => {
        try {
            // This is a "fire-and-forget" call. We don't need to process a return value.
            await axios.get(`http://localhost:8000/api/v1/reel/${reelId}/markViewer`,{
                withCredentials:true
            })
            // Calls POST /api/reels/:id/view
            return reelId;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Handles liking a reel and updating the state instantly
export const likeReel = createAsyncThunk(
    'reels/likeReel',
    async ({ reelId, userId }, { rejectWithValue }) => {
        try {
            await axios.get(`http://localhost:8000/api/v1/reel/${reelId}/reelLike`,{withCredentials:true});
            // We return the IDs so the reducer can find and update the correct reel
            return { reelId, userId };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Handles unliking a reel
export const unlikeReel = createAsyncThunk(
    'reels/unlikeReel',
    async ({ reelId, userId }, { rejectWithValue }) => {
        try {
            await axios.get(`http://localhost:8000/api/v1/reel/${reelId}/reelDislike`,{withCredentials:true});
            return { reelId, userId };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);


//================================================================
// 2. THE SLICE DEFINITION
//================================================================

const initialState = {
    // For the main scrollable "/BestReels" feed
    feed: {
        reels: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
        currentPage: 1,
        hasNextPage: true, // From your backend pagination
    },
    // For the grid of reels on a user's profile page
    profile: {
        reels: [],
        status: 'idle',
        error: null,
    },
};

export const reelSlice = createSlice({
    name: 'reels',
    initialState,
    // Synchronous reducers
    reducers: {
        // Used for pull-to-refresh to clear the feed
        clearFeed: (state) => {
            state.feed.reels = [];
            state.feed.currentPage = 1;
            state.feed.hasNextPage = true;
            state.feed.status = 'idle';
        },
        // Clears profile reels when navigating to a new user
        clearProfile: (state) => {
            state.profile.reels = [];
            state.profile.status = 'idle';
        }
    },
    // Asynchronous reducers (handles the thunks)
    extraReducers: (builder) => {
        builder
            .addCase(createReel.fulfilled, (state, action) => {
                if (action.payload) {
                    state.feed.reels.unshift(action.payload);
                }
            })
            .addCase(fetchFeedReels.pending, (state) => {
                state.feed.status = 'loading';
            })
            // --- THIS IS THE FINAL FIX ---
            .addCase(fetchFeedReels.fulfilled, (state, action) => {
                state.feed.status = 'succeeded';

                if (action.payload && Array.isArray(action.payload.data)) {
                    // 1. Create a Set of existing reel IDs for fast lookups.
                    const existingIds = new Set(state.feed.reels.map(r => r._id));

                    // 2. Filter the incoming data to remove nulls AND duplicates.
                    const newReels = action.payload.data.filter(
                        reel => reel && reel._id && !existingIds.has(reel._id)
                    );

                    // 3. Push only the truly new reels into the state.
                    state.feed.reels.push(...newReels);
                }

                state.feed.currentPage = action.payload.pagination.currentPage + 1;

                if (action.payload && action.payload.pagination) {
                    state.feed.hasNextPage = action.payload.pagination.hasNextPage;
                }
            })
            .addCase(fetchFeedReels.rejected, (state, action) => {
                // --- I'VE ADDED A DETAILED LOG HERE ---
                // If the thunk fails, this will run.
                console.error("fetchFeedReels REJECTED. Error payload:", action?.payload);
                state.feed.status = 'failed';
                // Use optional chaining (?.) for safety, in case payload is not an object
                state.feed.error = action.payload?.message || 'Failed to fetch reels';
            })

            // ... (rest of your extraReducers for profile, likes, etc.)
            .addCase(fetchProfileReels.pending, (state) => {
                state.profile.status = 'loading';
            })
            .addCase(fetchProfileReels.fulfilled, (state, action) => {
                state.profile.status = 'succeeded';
                state.profile.reels = action.payload;
            })
            .addCase(fetchProfileReels.rejected, (state, action) => {
                state.profile.status = 'failed';
                state.profile.error = action.payload?.message;
            })
            .addCase(likeReel.fulfilled, (state, action) => {
                const { reelId, userId } = action.payload;
                const updateReel = (reel) => {
                    if (reel && reel._id === reelId) {
                        reel.likes.push(userId);
                        reel.isLikedByCurrentUser = true;
                    }
                };
                state.feed.reels.forEach(updateReel);
                state.profile.reels.forEach(updateReel);
            })
            .addCase(unlikeReel.fulfilled, (state, action) => {
                const { reelId, userId } = action.payload;
                const updateReel = (reel) => {
                    if (reel && reel._id === reelId) {
                        reel.likes = reel.likes.filter(id => id !== userId);
                        reel.isLikedByCurrentUser = false;
                    }
                };
                state.feed.reels.forEach(updateReel);
                state.profile.reels.forEach(updateReel);
            });
    },

});

export const { clearFeed, clearProfile } = reelSlice.actions;

export default reelSlice.reducer;
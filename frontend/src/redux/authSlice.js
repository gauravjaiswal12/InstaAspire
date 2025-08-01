// import { createSlice } from '@reduxjs/toolkit'
//
// const initialState = {
//     user:null,
//     suggestedUsers:[],
//     userProfile:null,
//     selectedUser:null,
// }
//
// export const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {
//         //actions
//         setAuthUser:(state,action)=>{
//             state.user=action.payload;
//         },
//         setSuggestedUsers:(state,action)=>{
//             state.suggestedUsers=action.payload;
//         },
//         setUserProfile:(state,action)=>{
//             state.userProfile=action.payload;
//         },
//         setSelectedUser:(state,action)=>{
//             state.selectedUser=action.payload;
//         }
//     },
// })
//
// // Action creators are generated for each case reducer function
// export const {setAuthUser,setSuggestedUsers,setUserProfile,setSelectedUser} = authSlice.actions
//
// export default authSlice.reducer

// src/redux/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {toast} from "sonner";

// --- 1. THE ASYNC THUNK FOR FOLLOWING/UNFOLLOWING A USER ---
export const followUser = createAsyncThunk(
    'auth/followUser',
    async (userIdToToggle, { getState, rejectWithValue }) => {
        try {
            const response = await axios.post(
                `http://localhost:8000/api/v1/user/${userIdToToggle}/followOrUnfollow`,
                {}, // Empty body for the POST request
                { withCredentials: true }
            );
            toast.success(response.data.message);

            // We need to know if we are following or unfollowing to update the state correctly.
            // We can check if the user was already in our following list before the API call.
            const { auth } = getState();
            const isCurrentlyFollowing = auth.user.following.includes(userIdToToggle);

            return {
                toggledUserId: userIdToToggle,
                wasFollowing: isCurrentlyFollowing,
                message: response.data.message // Pass the success message for toasts
            };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    user: null,
    suggestedUsers: [],
    userProfile: null,
    selectedUser: null,
    status: 'idle',
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthUser: (state, action) => {
            state.user = action.payload;
        },
        // Your original reducer, which is used by your custom hook. This is correct.
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile:(state,action)=>{
            state.userProfile=action.payload;
        },
        setSelectedUser:(state,action)=>{
            state.selectedUser=action.payload;
        }
    },
    // --- 2. HANDLE THE followUser THUNK ---
    extraReducers: (builder) => {
        builder
            .addCase(followUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(followUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const { toggledUserId, wasFollowing } = action.payload;

                if (state.user) {
                    // This is the magic part. We update the main user's `following` list.
                    // This state change will automatically trigger your useGetSuggestedUser hook to re-run.
                    if (wasFollowing) {
                        // If we were following, remove them (unfollow).
                        state.user.following = state.user.following.filter(id => id !== toggledUserId);
                    } else {
                        // If we were not following, add them (follow).
                        state.user.following.push(toggledUserId);
                    }
                }

                // We also remove the followed user from the suggestions list for an instant UI update.
                state.suggestedUsers = state.suggestedUsers.filter(
                    (user) => user._id !== toggledUserId
                );
            })
            .addCase(followUser.rejected, (state, action) => {
                state.status = 'failed';
                // You can store the error message if you want to display it
                // state.error = action.payload;
            });
    }
});

export const { setAuthUser, setSuggestedUsers, setUserProfile, setSelectedUser } = authSlice.actions;
export default authSlice.reducer;

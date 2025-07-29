import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user:null,
    suggestedUsers:[],
    userProfile:null,
    selectedUser:null,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        //actions
        setAuthUser:(state,action)=>{
            state.user=action.payload;
        },
        setSuggestedUsers:(state,action)=>{
            state.suggestedUsers=action.payload;
        },
        setUserProfile:(state,action)=>{
            state.userProfile=action.payload;
        },
        setSelectedUser:(state,action)=>{
            state.selectedUser=action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const {setAuthUser,setSuggestedUsers,setUserProfile,setSelectedUser} = authSlice.actions

export default authSlice.reducer
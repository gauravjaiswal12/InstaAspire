import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    posts:[],
    selectedPost:null,
}

export const postSlice = createSlice({
    name: 'post',
    initialState,
    reducers: {
        //actions
        setPosts:(state,action)=>{
            state.posts=action.payload;
        },
        setSelectedPost:(state,action)=>{
            state.selectedPost=action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const {setPosts,setSelectedPost} = postSlice.actions

export default postSlice.reducer
const BASE_URL = process.env.REACT_APP_BASE_URL;
console.log("REACT_APP_BASE_URL",BASE_URL);

//userEndpoints
export const userEndpoints = {
    register_api:BASE_URL+"/user/register",
    logout_api:BASE_URL+"/user/logout",
    login_api:BASE_URL+"/user/login",
    //this is formed a function which returns the url for axios call
    profile_api:(id)=>`${BASE_URL}/user/${id}/profile`,
    edit_profile_api:BASE_URL+"/user/profile/edit",
    suggested_api:BASE_URL+"/user/suggested",
    follow_api:(id)=>`${BASE_URL}/user/${id}/followOrUnfollow`,
}

export const postEndpoints = {
    addNewPost_api:BASE_URL+"/post/addNewPost",
    getAllPosts_api:BASE_URL+"/post/all",
    getUserPost_api:BASE_URL+"/post/userPost/all",
    likePost_api:(id)=>`${BASE_URL}/post/${id}/like`,
    dislikePost_api:(id)=>`${BASE_URL}/post/${id}/dislike`,
    addComment_api:(id)=>`${BASE_URL}/post/${id}/comment`,
    getCommentsOfPost_api:(id)=>`${BASE_URL}/post/${id}/comment/all`,
    deletePost_api:(id)=>`${BASE_URL}/post/delete/${id}`,
    bookmarkPost_api:(id)=>`${BASE_URL}/post/${id}/bookmark`,
}

export const messageEndpoints = {
    sendMessage_api:(id)=>`${BASE_URL}/message/send/${id}`,
    getMessage_api:(id)=>`${BASE_URL}/message/all/${id}`,
}
const express = require('express');
const {isAuthenticated} = require("../middlewares/auth");
const {addNewPost,getAllPosts,getUserPost,likePost,dislikePost,addComment,getCommentsOfPost, deletePost, bookmarkPost} = require("../controllers/post");
const router = express.Router();

router.post('/addPost',isAuthenticated,addNewPost);
router.get('/all',isAuthenticated,getAllPosts);
router.get('/userPost/all',isAuthenticated,getUserPost);
router.post('/:id/like',isAuthenticated,likePost);
router.post('/:id/dislike',isAuthenticated,dislikePost);
router.post('/:id/comment',isAuthenticated,addComment);
router.get('/:id/comment/all',isAuthenticated,getCommentsOfPost);
router.delete('/delete/:id',isAuthenticated,deletePost);
router.get('/:id/bookmark',isAuthenticated,bookmarkPost);

module.exports = router;
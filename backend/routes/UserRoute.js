const express = require('express');
const {register, login, logout, getProfile, editProfile, getSuggestedUser, followOrUnfollow} = require("../controllers/user");
const {isAuthenticated} = require("../middlewares/auth");
const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.post('/logout',logout);
router.get( '/:id/profile',isAuthenticated,getProfile);
router.post('/profile/edit',isAuthenticated,editProfile);
router.get('/suggested',isAuthenticated,getSuggestedUser);
router.post('/:id/followOrUnfollow',isAuthenticated,followOrUnfollow);

 module.exports = router;


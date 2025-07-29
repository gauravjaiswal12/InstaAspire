const express = require('express');
const {isAuthenticated} = require("../middlewares/auth");
const {addNewReel,getBestReels,getUserReels,getReelsByUserId,likeReels,dislikeReels,addReelComment,getCommentOnReels,addMarkViewer} = require("../controllers/reels");
const router = express.Router();

router.post('/createReel',isAuthenticated,addNewReel);
router.get('/UserReels',isAuthenticated,getUserReels);
router.get('/BestReels',isAuthenticated,getBestReels);
router.get('/otherUserReels/:id', isAuthenticated, getReelsByUserId);
router.get('/:id/reelLike',isAuthenticated,likeReels);
router.get('/:id/reelDislike',isAuthenticated,dislikeReels);
router.post('/:id/reelComment',isAuthenticated,addReelComment);
router.get('/:id/reelComment/all',isAuthenticated,getCommentOnReels);
router.get('/:id/markViewer',isAuthenticated,addMarkViewer);

module.exports = router;


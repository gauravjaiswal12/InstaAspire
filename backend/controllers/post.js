const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {uploadMediaToCloudinary} = require('../utils/uploadMediaToCloudinary');
const { v4: uuid } = require('uuid');
const Post=require('../models/Post');
const User=require('../models/User');
const Comment=require('../models/Comment');
const {getReceiverSocketId,io} = require("../socket/socket");
require("dotenv").config();

exports.addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const file = req.files?.media;
        const authorId = req.id;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Please add an image or video",
            });
        }

        const isVideo = file.mimetype.startsWith("video/");
        let uploadedMedia;
        let tempFilePathToDelete = null; // To keep track of temp files we create

        if (isVideo) {
            // For videos, upload directly without local processing
            uploadedMedia = await uploadMediaToCloudinary(file, process.env.FOLDER_NAME);
        } else {
            // --- Image processing logic (this part is good) ---
            const tempFileName = `${uuid()}.jpeg`;
            const processedImageTempPath = path.join(__dirname, "..", "temp", tempFileName);
            fs.mkdirSync(path.dirname(processedImageTempPath), { recursive: true });

            await sharp(file.tempFilePath)
                .resize({ width: 468, height: 585, fit: "cover" })
                .toFormat("jpeg", { quality: 90 })
                .toFile(processedImageTempPath);

            // Upload the *processed* image to Cloudinary
            uploadedMedia = await uploadMediaToCloudinary(
                { tempFilePath: processedImageTempPath, mimetype: "image/jpeg" }, // Pass an object with the new path and mimetype
                process.env.FOLDER_NAME,
                800, // These height/quality args are for the uploader, though Sharp already handled it
                80
            );

            // Mark the created temp file for deletion
            tempFilePathToDelete = processedImageTempPath;
        }

        // --- ⭐ KEY CHANGE STARTS HERE ---

        // Clean up the temp file if one was created
        if (tempFilePathToDelete) {
            fs.unlinkSync(tempFilePathToDelete);
        }

        // A much more robust check. If the upload failed, our helper would not return a mediaUrl.
        if (!uploadedMedia || !uploadedMedia.mediaUrl) {
            return res.status(500).json({
                success: false,
                message: "Media upload failed.",
            });
        }

        // Create the post using the unified `mediaUrl` from our smart helper function.
        // No more `eagerUrl || originalUrl` logic needed here!
        const post = await Post.create({
            caption,
            mediaUrl: uploadedMedia.mediaUrl,
            mediaType: uploadedMedia.resource_type,
            author: authorId,
        });

        console.log("✅ Post created successfully in backend:", post);

        // --- ⭐ KEY CHANGE ENDS HERE ---

        const user = await User.findById(authorId);
        user.posts.push(post._id);
        await user.save();

        await post.populate({
            path: "author",
            select: "-password",
        });

        return res.status(201).json({
            success: true,
            message: "Post added successfully",
            post,
        });
    } catch (e) {
        // Improved error logging
        console.error("❌ Error in addNewPost:", e);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while adding the post.",
            error: e.message, // Provide error message for easier debugging
        });
    }
};

//getAllPosts
exports.getAllPosts=async (req,res)=>{
    try{
        const posts=await Post.find().sort({createdAt:-1}).populate({
            path:'author',
            select:'username profilePicture'
        }).populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username profilePicture'
            }
        });
        return res.status(200).json({
            success:true,
            posts:posts
        })
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while getting all posts"
        })
    }
}

//getUserPosts
exports.getUserPost=async (req,res)=>{
    try{
        const authorId=req.id;
        const posts=await Post.find({author:authorId}).sort({createdAt:-1}).populate({
            path:'author',
            select:'username profilePicture'
        }).populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username profilePicture'
            }
        })
        return res.status(200).json({
            success:true,
            posts:posts
        })
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while getting user posts"
        })
    }
}

//like
exports.likePost=async (req,res)=>{
    try{
        const likerUserId=req.id;
        const postId=req.params.id;
        const post=await Post.findById(postId);
        if(!post){
            return res.status(401).json({
                success:false,
                message:"Post not found"
            })
        }

        await post.updateOne({$addToSet:{likes:likerUserId}});
        await post.save();

        //implement socket io for real time updates
        const user=await User.findById(likerUserId).select('username profilePicture');
        const postOwnerId=post.author.toString();
        if(postOwnerId!==likerUserId){
             //send socket io notification to post owner
            const notification={
                type:'like',
                userId:likerUserId,
                postId,
                message:'Your post has been liked by '+user.username+''
            }
            const postOwnerSocketId=getReceiverSocketId(postOwnerId);
            if(postOwnerSocketId){
                //send socket io notification to post owner
                io.to(postOwnerSocketId).emit('Notification',notification);
            }
        }

        return res.status(200).json({
            success:true,
            message:"Liked successfully",
        })

    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while liking post"
        })
    }
}
//Dislike
exports.dislikePost=async (req,res)=>{
    try{
        const likerUserId=req.id;
        const postId=req.params.id;
        const post=await Post.findById(postId);
        if(!post){
            return res.status(401).json({
                success:false,
                message:"Post not found"
            })
        }
        const isLiked=post.likes.includes(likerUserId);
        if(!isLiked){
            return res.status(401).json({
                success:false,
                message:"You have not liked this post"
            })
        }
        await post.updateOne({$pull:{likes:likerUserId}});
        await post.save();

        //implement socket io for real time updates
        const user=await User.findById(likerUserId).select('username profilePicture');
        const postOwnerId=post.author.toString();
        if(postOwnerId!==likerUserId){
            //send socket io notification to post owner
            const notification={
                type:'dislike',
                userId:likerUserId,
                postId,
                message:'Your post has been disliked by '+user.username+''
            }
            const postOwnerSocketId=getReceiverSocketId(postOwnerId);
            if(postOwnerSocketId){
                //send socket io notification to post owner
                io.to(postOwnerSocketId).emit('Notification',notification);
            }
        }

        return res.status(200).json({
            success:true,
            message:"Like removed successfully",
        })

    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while removing like from post"
        })
    }
}

//add comment
exports.addComment=async (req,res)=>{
    try{
        const commenterUserId=req.id;
        const postId=req.params.id;
        const {comment}=req.body;
        const post=await Post.findById(postId);
        if(!post){
            return res.status(401).json({
                success:false,
                message:"Post not found to add comment"
            })
        }
        if(!comment){
            return res.status(400).json({
                success:false,
                message:"Please add a comment"
            })
        }
        const commentObj={
            text:comment,
            author:commenterUserId,
            post:postId,
        }
        // My work that one user should be able to add one comment on a post
        //add likes and dislikes to comment
        //add replies to comment
        const newComment=await Comment.create(commentObj);
        await post.updateOne({$addToSet:{comments:newComment._id}});
        await newComment.populate({
            path:'author',
            select:'username profilePicture'
        })
        await newComment.save();
        return res.status(201).json({
            success:true,
            message:"Comment added successfully",
            comment:newComment,
        })
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while adding comment"
        })
    }
}

//getComments
exports.getCommentsOfPost=async (req,res)=>{
    try{
        const postId=req.params.id;
        const comments=await Comment.find({post:postId}).sort({createdAt:-1}).populate({
            path:'author',
            select:'username profilePicture'
        });
        if(!comments){
            return res.status(401).json({
                success:false,
                message:"Comments not found"
            })
        }
        return res.status(200).json({
            success:true,
            comments:comments
        })
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while getting comments"
        })
    }
}

//delete post
exports.deletePost=async (req,res)=>{
    try{
        const authorId=req.id;
        const postId=req.params.id;
        const post=await Post.findById(postId);
        if(!post){
            return res.status(401).json({
                success:false,
                message:"Post not found for deletion"
            })
        }
        if(post.author.toString()!==authorId){
            return res.status(401).json({
                success:false,
                message:"You are not authorized to delete this post"
            })
        }
        const user=await User.findById(authorId);
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User not found who is deleting the post"
            })
        }
        user.posts=user.posts.filter(id=>id.toString()!==postId.toString());
        await user.save();
        await Post.findByIdAndDelete(postId);

        //delete associated comments
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            success:true,
            message:"Post deleted successfully",
        })
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while deleting post"
        })
    }
}

//bookmark
exports.bookmarkPost=async (req,res)=>{
    try{
        const bookmarkerUserId=req.id;
        const postId=req.params.id;
        const post=await Post.findById(postId);
        if(!post){
            return res.status(401).json({
                success:false,
                message:"Post not found to bookmark"
            })
        }
        const user=await User.findById(bookmarkerUserId);

       const isBookmarked=user.bookmarks.includes(postId);

        if(isBookmarked) {
            await user.updateOne({$pull: {bookmarks: postId}});
            await user.save();
            return res.status(200).json({
                success: true,
                type:'unsaved',
                message: "Post unbookmarked successfully",
            })
        }
        await user.updateOne({$addToSet:{bookmarks:postId}});
        await user.save();
        return res.status(200).json({
            success:true,
            type:'saved',
            message:"Post bookmarked successfully",
        })

    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while bookmarking post"
        })
    }
}
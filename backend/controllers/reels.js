const {uploadMediaToCloudinary} = require("../utils/uploadMediaToCloudinary");
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const Reel=require('../models/Reels');
const User=require('../models/User');

// Required for local file processing with FFmpeg
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static'); // <-- ADD THIS LINE

// Tell fluent-ffmpeg where to find the FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath); // <-- AND ADD THIS LINE
const fs = require('fs');
const path = require('path');
const Post = require("../models/Post");
const {getReceiverSocketId, io} = require("../socket/socket");
const Comment = require("../models/Comment");
require("dotenv").config();

// Helper function remains the same
const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

//other method is fluent-ffmpeg
exports.addNewReel =async (req,res) => {
    // --- SETUP FOR TEMP FILES ---
    const tempDir = path.join(__dirname, '..', 'temp');
    let tempVideoPath = '';
    let tempAudioPath = '';
    let finalVideoPath = '';
    try{
        const { caption } = req.body;
        // Use more descriptive names to avoid confusion
        const originalVideoFile = req.files?.videoFile;
        const customAudioFile = req.files?.audioFile;
        const authorId = req.id;

        if (!originalVideoFile) {
            return res.status(400).json({success: false, message: "A video file is required."});
        }
        // --- STEP 1: PREPARE FILES ON SERVER ---
        ensureDirExists(tempDir);
        // Save the original uploaded video to a temporary path
        tempVideoPath = path.join(tempDir, `video-${Date.now()}-${originalVideoFile.name}`);
        await originalVideoFile.mv(tempVideoPath);

        let audioData = null;

        if (customAudioFile) {
            // --- SCENARIO A: MERGE WITH CUSTOM AUDIO ---
            console.log("Custom audio provided. Starting FFmpeg merge...");
            // Save the custom audio to a temporary path
            tempAudioPath = path.join(tempDir, `audio-${Date.now()}-${customAudioFile.name}`);
            await customAudioFile.mv(tempAudioPath);

            // Define the path for the output file from FFmpeg
            finalVideoPath = path.join(tempDir, `merged-${Date.now()}.mp4`);

            // Run the FFmpeg merge process
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(tempVideoPath)
                    .input(tempAudioPath)
                    .outputOptions(['-map 0:v:0', '-map 1:a:0', '-c:v copy', '-c:a aac', '-shortest'])
                    .on('end', resolve)
                    .on('error', reject)
                    .save(finalVideoPath);
            });

            audioData = { name: "Custom Audio", artist: "User Upload" }; // Set metadata

        } else {
            // --- SCENARIO B: USE ORIGINAL VIDEO ---
            console.log("No custom audio provided. Using original video.");
            finalVideoPath = tempVideoPath; // The file to upload is the original video
            const author = await User.findById(authorId).select('username');
            audioData = { name: "Original Audio", artist: author?.username || "Unknown" };
        }

        // --- STEP 2: UPLOAD THE FINAL VIDEO USING YOUR FUNCTION ---
        console.log(`Uploading final video to Cloudinary from path: ${finalVideoPath}`);

        // Create a mock file object that matches what your uploader expects
        const fileToUpload = {
            tempFilePath: finalVideoPath,
            mimetype: 'video/mp4' // The final file is always a video
        };

        // Call your powerful uploader with the processed file
        const uploadedResult = await uploadMediaToCloudinary(
            fileToUpload,
            process.env.FOLDER_NAME
        );

        // uploadedResult is { mediaUrl, resource_type, public_id }
        const hlsVideoUrl = uploadedResult.mediaUrl;
        const public_id = uploadedResult.public_id;


        // --- STEP 3: GENERATE THUMBNAIL AND SAVE ---

        // Generate thumbnail from the Cloudinary public_id (still the best way)
        const thumbnailUrl = cloudinary.url(public_id, {
            resource_type: 'video',
            transformation: [{ fetch_format: 'jpg' }, { start_offset: 1 }, { quality: 'auto' }],
            secure: true
        });

        const newReel = new Reel({
            caption,
            author: authorId,
            videoUrl: hlsVideoUrl, // ✅ Save the HLS streaming URL!
            thumbnailUrl: thumbnailUrl,
            audio: audioData,
        });
        await newReel.save();

        return res.status(201).json({
            success: true,
            message: "Reel created successfully!",
            data: newReel,
        });


    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong"
        })
    }finally {
        // --- STEP 4: ALWAYS CLEAN UP TEMP FILES ---
        console.log("Cleaning up temporary files...");
        if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
        if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
        // Ensure we don't try to delete the same file twice
        if (finalVideoPath !== tempVideoPath && fs.existsSync(finalVideoPath)) {
            fs.unlinkSync(finalVideoPath);
        }
    }
}

//gets all the reels of user
//also show newOne firstly
exports.getUserReels=async (req,res)=>{
    try{
        const authorId=req.id;
        const reels=await Reel.find({author:authorId}).sort({createdAt:-1});
        return res.status(200).json({
            success:true,
            reels:reels
        })
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong , while fetching the reels of signed user"
        })
    }
}

exports.getReelsByUserId=async (req,res)=>{
    try{
        const authorId=req.params.id;
        const reels=await Reel.find({author:authorId}).sort({createdAt:-1});
        return res.status(200).json({
            success:true,
            reels:reels
        })
    }catch (e) {
        console.log(e);
    }
}

//the Hacker News Algorithm
// exports.getBestReels = async (req, res) => {
//     try {
//         // --- 1. SETUP & AUTHENTICATION ---
//         const userId = req.id;
//         const objectIdUserId =new mongoose.Types.ObjectId(userId);
//
//         // --- 2. PAGINATION PARAMETERS ---
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;
//
//         // --- 3. ALGORITHM CONSTANTS ---
//         const GRAVITY = 1.8;
//         const PERSONALIZATION_MULTIPLIER = 5;
//
//         // --- 4. DATA FETCHING (CONCURRENT) ---
//         // Fetch user's details and total count from the 'Reel' collection
//         const [user, totalReelsCount] = await Promise.all([
//             User.findById(userId).select('following viewedReels').lean(),
//             Reel.countDocuments() // <<< CHANGE: Counting documents in 'Reel' collection
//         ]);
//
//         const followedAuthors = user ? user.following : [];
//         const viewedReelIds = user ? user.viewedReels : [];
//
//         // --- 5. THE CORE AGGREGATION PIPELINE on the 'Reel' collection ---
//         const reels = await Reel.aggregate([ // <<< CHANGE: Aggregating on the 'Reel' model
//             // STAGE 0: FILTER
//             {
//                 $match: {
//                     _id: { $nin: viewedReelIds }
//                 }
//             },
//
//             // STAGE I: CALCULATE ENGAGEMENT & TIME
//             {
//                 $addFields: {
//                     points: { $size: { "$ifNull": ["$likes", []] } },
//                     ageInHours: { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 3600000] }
//                 }
//             },
//
//             // STAGE II: CALCULATE HACKER NEWS SCORE
//             {
//                 $addFields: {
//                     hackerNewsScore: {
//                         $divide: [
//                             { $max: [0, { $subtract: ["$points", 1] }] },
//                             { $pow: [{ $max: [0.1, { $add: ["$ageInHours", 2] }] }, GRAVITY] }
//                         ]
//                     }
//                 }
//             },
//
//             // STAGE III: APPLY PERSONALIZATION BOOST
//             {
//                 $addFields: {
//                     finalScore: {
//                         $multiply: [
//                             "$hackerNewsScore",
//                             { $cond: { if: { $in: ["$author", followedAuthors] }, then: PERSONALIZATION_MULTIPLIER, else: 1 } }
//                         ]
//                     }
//                 }
//             },
//
//             // STAGE IV: SORT AND PAGINATE
//             { $sort: { finalScore: -1 } },
//             { $skip: skip },
//             { $limit: limit },
//
//             // STAGE V: POPULATE AUTHOR DETAILS (No change here, this is correct)
//             { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorDetails' } },
//             { $unwind: { path: '$authorDetails', preserveNullAndEmptyArrays: true } },
//
//             // STAGE VI: PROJECT FINAL, CLEAN FIELDS
//             {
//                 $project: {
//                     _id: 1,
//                     videoUrl: 1,
//                     thumbnailUrl: 1, // Including fields from your Reel schema
//                     caption: 1,
//                     likes: 1, // Sending the full likes array for now
//                     viewCount: 1,
//                     audio: 1,      // Including audio object
//                     createdAt: 1,
//                     author: { _id: "$authorDetails._id", username: "$authorDetails.username", profilePicture: "$authorDetails.profilePicture" },
//                     isLikedByCurrentUser: { $in: [objectIdUserId, { "$ifNull": ["$likes", []] }] }
//                 }
//             }
//         ]);
//
//         // --- 6. CONSTRUCT AND SEND THE FINAL RESPONSE ---
//         return res.status(200).json({
//             success: true,
//             data: reels,
//             pagination: {
//                 currentPage: page,
//                 limit: limit,
//                 hasNextPage: (skip + reels.length) < totalReelsCount
//             }
//         });
//
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: "An internal server error occurred while fetching reels."
//             }
//         )
//     }
// };

// In your backend/controllers/reels.js

exports.getBestReels = async (req, res) => {
    try {
        // --- 1. SETUP & AUTHENTICATION ---
        const userId = req.id;
        // FIX #1: Use the 'new' keyword to create a valid ObjectId.
        const objectIdUserId = new mongoose.Types.ObjectId(userId);

        // --- 2. PAGINATION PARAMETERS ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // --- 3. ALGORITHM CONSTANTS ---
        const GRAVITY = 1.8;
        const PERSONALIZATION_MULTIPLIER = 5;

        // --- 4. DATA FETCHING (CONCURRENT) ---
        const [user, totalReelsCount] = await Promise.all([
            User.findById(userId).select('following viewedReels').lean(),
            Reel.countDocuments()
        ]);

        // FIX #2: Ensure these are ALWAYS arrays to prevent the $nin error.
        const followedAuthors = user?.following || [];
        const viewedReelIds = user?.viewedReels || [];


        // --- NEW DEBUGGING LOG ---
        // This will show you exactly which reels are being filtered out.
        console.log(`[DEBUG] User ${userId} has ${viewedReelIds.length} viewed reels. Filtering them out.`);
        console.log('[DEBUG] Viewed IDs:', viewedReelIds);

        // --- 5. THE CORE AGGREGATION PIPELINE ---
        const reels = await Reel.aggregate([
            // STAGE 0: FILTER
            {
                $match: {
                    _id: { $nin: viewedReelIds }
                }
            },

            // ... (The rest of your aggregation pipeline is excellent and remains unchanged) ...
            // STAGE I: CALCULATE ENGAGEMENT & TIME
            {
                $addFields: {
                    points: {
                        $add: [
                            { $size: { "$ifNull": ["$likes", []] } }, // Number of likes
                            { "$ifNull": ["$viewCount", 0] }         // Number of views
                        ]
                    },
                    ageInHours: { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 3600000] }
                }
            },
            // STAGE II: CALCULATE HACKER NEWS SCORE
            {
                $addFields: {
                    hackerNewsScore: {
                        $divide: [
                            { $max: [0, "$points"] },
                            { $pow: [{ $max: [0.1, { $add: ["$ageInHours", 2] }] }, GRAVITY] }
                        ]
                    }
                }
            },
            // STAGE III: APPLY PERSONALIZATION BOOST
            {
                $addFields: {
                    finalScore: {
                        $multiply: [
                            "$hackerNewsScore",
                            { $cond: { if: { $in: ["$author", followedAuthors] }, then: PERSONALIZATION_MULTIPLIER, else: 1 } }
                        ]
                    }
                }
            },
            // STAGE IV: SORT AND PAGINATE
            { $sort: { finalScore: -1 } },
            { $skip: skip },
            { $limit: limit },
            // STAGE V: POPULATE AUTHOR DETAILS
            { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorDetails' } },
            { $unwind: { path: '$authorDetails', preserveNullAndEmptyArrays: true } },
            // Add a new $match stage to filter out any documents where the author lookup failed.
            {
                $match: {
                    "authorDetails._id": { $exists: true, $ne: null }
                }
            },
            // STAGE VI: PROJECT FINAL, CLEAN FIELDS
            {
                $project: {
                    _id: 1,
                    videoUrl: 1,
                    thumbnailUrl: 1,
                    caption: 1,
                    likes: 1,
                    viewCount: 1,
                    audio: 1,
                    createdAt: 1,
                    author: { _id: "$authorDetails._id", username: "$authorDetails.username", profilePicture: "$authorDetails.profilePicture" },
                    isLikedByCurrentUser: { $in: [objectIdUserId, { "$ifNull": ["$likes", []] }] }
                }
            }
        ]);

        // --- 6. CONSTRUCT AND SEND THE FINAL RESPONSE ---
        return res.status(200).json({
            success: true,
            data: reels,
            pagination: {
                currentPage: page,
                limit: limit,
                hasNextPage: (skip + reels.length) < totalReelsCount
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred while fetching reels."
        });
    }
};
//written by gemini
exports.likeReels = async (req, res) => {
    try {
        // 1. Get the user ID from auth middleware and reel ID from URL parameters
        const likerUserId = req.id;
        const reelId = req.params.id;

        // 2. Perform a single, atomic update to the database.
        // This finds the reel and adds the user's ID to the 'likes' array.
        // - $addToSet: Ensures the user ID is only added if it's not already present.
        // - { new: true }: Returns the updated document after the change.
        const updatedReel = await Reel.findByIdAndUpdate(
            reelId,
            { $addToSet: { likes: likerUserId } },
            { new: true }
        ).populate('author', 'username'); // We populate the author to get their ID easily

        // 3. Handle the case where the reel doesn't exist.
        if (!updatedReel) {
            return res.status(404).json({ // Use 404 "Not Found" for clarity
                success: false,
                message: "Reel not found."
            });
        }

        // --- 4. REAL-TIME NOTIFICATION LOGIC ---

        // Fetch the user who performed the like to get their details for the notification.
        const liker = await User.findById(likerUserId).select('username profilePicture');

        // Check if the user is liking their own reel. Don't send a notification for self-likes.
        const reelOwnerId = updatedReel.author._id.toString();

        if (reelOwnerId !== likerUserId) {
            // Construct the notification payload
            const notification = {
                type: 'reel_like',
                sender: { // Send a clean sender object
                    _id: liker._id,
                    username: liker.username,
                    profilePicture: liker.profilePicture
                },
                reel: {
                    _id: updatedReel._id,
                    thumbnailUrl: updatedReel.thumbnailUrl // Send a thumbnail for the UI
                },
                message: `${liker.username} liked your reel.`,
                createdAt: new Date()
            };

            // Find the socket ID of the reel's owner
            const receiverSocketId = getReceiverSocketId(reelOwnerId);

            // If the owner is currently online (has an active socket), emit the notification
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newNotification', notification);
            }

            // Here you would also save this notification to a 'Notification' collection in your database
            // so the user can see it later if they were offline.
            // await Notification.create({ recipient: reelOwnerId, ...notification });
        }

        // 5. Send a success response
        return res.status(200).json({
            success: true,
            message: "Reel liked successfully."
        });

    } catch (e) {
        console.error("Error in likeReels controller:", e);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred while liking the reel."
        });
    }
};

exports.dislikeReels=async (req,res)=>{
    try{
        // 1. Get the user ID from auth middleware and reel ID from URL parameters
        const userId = req.id;
        const reelId = req.params.id;

        // 2. Perform a single, atomic update to the database.
        // This finds the reel and REMOVES the user's ID from the 'likes' array.
        // - We use the Mongoose '$pull' operator for this.
        // - { new: true }: Returns the updated document after the change.
        const updatedReel = await Reel.findByIdAndUpdate(
            reelId,
            { $pull: { likes: userId } }, // The key change is here: $pull removes the item
            { new: true }
        );

        // 3. Handle the case where the reel doesn't exist.
        if (!updatedReel) {
            return res.status(404).json({
                success: false,
                message: "Reel not found."
            });
        }

        // --- 4. REAL-TIME NOTIFICATION LOGIC ---
        //
        // NOTE: We intentionally DO NOT send a notification for an "unlike" action.
        // This is a standard user experience design choice to avoid sending
        // negative or unnecessary notifications to the content creator.
        //

        // 5. Send a success response
        return res.status(200).json({
            success: true,
            message: "Reel unliked successfully." // Updated success message
        });

    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while disliking reel"
        })
    }
}

//exports add comment
exports.addReelComment=async (req,res)=>{
    try{
        const commenterUserId=req.id;
        const reelId=req.params.id;
        const {comment}=req.body;
        const reel=await Reel.findById(reelId);
        if(!reel){
            return res.status(401).json({
                success:false,
                message:"Reel not found to add comment"
            })
        }
        if(!comment){
            return res.status(400).json({
                success:false,
                message:"Please add a comment for the reel"
            })
        }
        const commentObj={
            text:comment,
            author:commenterUserId,
            post:reelId,
        }
        // My work that one user should be able to add one comment on a post
        //add likes and dislikes to comment
        //add replies to comment
        const newComment=await Comment.create(commentObj);
        await reel.updateOne({$addToSet:{comments:newComment._id}});
        await newComment.populate({
            path:'author',
            select:'username profilePicture'
        })
        await newComment.save();
        return res.status(201).json({
            success:true,
            message:"Comment added successfully to the reel",
            comment:newComment,
        })
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while adding comment in reels"
        })
    }
}
//exports getComment
exports.getCommentOnReels=async (req,res)=>{
    try{
        const reelId=req.params.id;
        const comments=await Comment.find({post:reelId}).sort({createdAt:-1}).populate({
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
            message:"Something went wrong while getting comment on reels"
        })
    }
}

exports.addMarkViewer=async (req,res)=>{
    try{
        const userId=req.id;
        const reelId=req.params.id;
        // Use a single, atomic update to find the reel and increment its viewCount.
        // '$inc' is a highly efficient MongoDB operator specifically for this purpose.
        // { new: true } returns the updated document, so we get the new viewCount.
        const incrementReelViewCountPromise = Reel.findByIdAndUpdate(
            reelId,
            { $inc: { viewCount: 1 } },
            { new: true }
        );
        const markUserViewPromise = User.findByIdAndUpdate(userId, {
            $addToSet: { viewedReels: reelId }
        });


        // Promise.all runs both database calls concurrently.
        const [userUpdateResult, updatedReel] = await Promise.all([
            markUserViewPromise,
            incrementReelViewCountPromise
        ]);

        if (!updatedReel) {
            return res.status(404).json({ // Correct status code
                success: false,
                message: "Reel not found."
            });
        }
        return res.status(200).json({ // Correct status code
            success: true,
            message: "Reel view recorded successfully.",
            reel: updatedReel
        });

    }catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while adding mark viewer"
        })
    }
}



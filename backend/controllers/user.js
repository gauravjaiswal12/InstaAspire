const bcrypt=require('bcryptjs');
const User=require('../models/User');
const Post=require('../models/Post');
const jwt = require('jsonwebtoken');
const getDataUri = require("../utils/datauri");
const {uploadImageToCloudinary} = require("../utils/uploadMediaToCloudinary");
const cloudinary = require('cloudinary').v2;

exports.register=async (req,res)=>{
    try{
        const {username, email, password} = req.body;
        if(!username || !email || !password){
            return res.status(400).json({
                message:"something missing , please check all",
                success:false,
            });
        }

        const user=await User.findOne({email:email});
        if(user){
            return res.status(401).json({
                message:"Already registered",
                success:false,
                user:user,
            });
        }
        console.log("printing the user",user);
        const hashedPassword = await bcrypt.hash(password, 10);

        const createdUser=await User.create({
            username:username,
            email:email,
            password:hashedPassword,
        });
        return res.status(201).json({
            message:"Successfully registered",
            success:true,
            user:createdUser,
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again.",
        });
    }
}

//login

exports.login=async (req,res)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message:"something missing , please check all",
                success:false,
            });
        }
        let user=await User.findOne({email:email});
        if(!user){
            return res.status(401).json({
                message:"User not registered",
                success:false,
            })
        }
        const isPasswordMatch=await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                message:"Incorrect password",
                success:false,
            })
        }
        const token=jwt.sign({email: user.email,userId:user._id},process.env.JWT_SECRET,{expiresIn:'1d'});
        // Save token to user document in database
        user.token = token;
        user.password = undefined;
        //populate the post
        //it can be made fast as we already know that user will add only his post in the db using document of his id
        const populatedPosts=await Promise.all(
           user.posts.map(async (postId)=>{
               const post=await Post.findById(postId);
               if(post.author.equals(user._id)){
                   return post;
               }
               return null;
           })
        )
        user.posts=populatedPosts.filter(post=>post!==null);

        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };
        return res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            user,
            message: `User Login Success ${user.username}`,
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Cannot Login at the moment. Please try again.",
        });
    }
}

exports.logout=async (req,res)=>{
    try{
         return res.cookie("token",'',{maxAge:0}).json({
             success:true,
             message:'Logout successfully',
         });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "User Logout Server error",
        })
    }
};

//get profile
exports.getProfile=async (req,res)=>{
    try{
        const userId=req.params.id;
        let user=await User.findById(userId).populate({
            path:'posts',
            createdAt:-1,
        }).populate({
            path:'bookmarks',
        });
        if(!user){
            return res.status(401).json({
                message:"User not found",
                success:false,
            });
        }
        return res.status(200).json({
            success:true,
            user:user,
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed To Get Profile, server error",
        })
    }
};

//edit profile
exports.editProfile=async (req,res)=>{
    try{console.log("req.files is", req.files);
        const userId=req.id;
        const {bio,gender}=req.body;


        const profilePicture=req.files.profilePicture;
        console.log("the profile picture is ",profilePicture);
        let cloudResponse;

        if(profilePicture){
            const fileUri=getDataUri(profilePicture);
            // cloudResponse=await cloudinary.uploader.upload(fileUri);
            cloudResponse = await uploadImageToCloudinary(
               profilePicture,
               process.env.FOLDER_NAME,
               1000,
               1000
            )
            console.log("the cloud response is ",cloudResponse);

        }
        const user=await User.findById(userId).select("-password");
        if(!user){
            return res.status(401).json({
                message:"User not found",
                success:false,
            })
        }
        if(bio) user.bio=bio;
        if(gender) user.gender=gender;
        if(profilePicture) user.profilePicture=cloudResponse.secure_url;

        await user.save();
        return res.status(200).json({
            success:true,
            message:"Profile successfully updated",
            user,
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "User Edit Profile Failed",
        })
    }
}

//get suggestedUser
exports.getSuggestedUser=async (req,res)=>{
    try{
        const suggestedUsers=await User.find({_id:{$ne:req.id}}).select("-password");
        if(!suggestedUsers){
            return res.status(401).json({
                message:"Currently suggested user does not exist",
                success:false,
            })
        }
        return res.status(200).json({
            success:true,
            users:suggestedUsers
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message: "Suggested User not found due to network error",
        })
    }
}
exports.followOrUnfollow=async (req,res)=>{
    try{
        const myId=req.id;
        const toFollowUserId=req.params.id;
        if(myId === toFollowUserId){
            return res.status(400).json({
                success:false,
                message:"Cannot follow yourself",
            })
        }
        const user=await User.findById(myId);
        const targetUser=await User.findById(toFollowUserId);
        if(!user || !targetUser){
            return res.status(401).json({
                success:false,
                message:"User not found",
            })
        }
        //now check whether to follow or unfollow
        const isFollowing=user.following.includes(toFollowUserId);
        if(isFollowing){
            //unfollow logic
            user.following=user.following.filter(id=>id.toString()!==toFollowUserId.toString());
            targetUser.followers=targetUser.followers.filter(id=>id.toString()!==myId.toString());
            await user.save();
            await targetUser.save();
            return res.status(200).json({
                success:true,
                message:"Unfollowed successfully",
            })
        }else{
            //follow logic
            user.following.push(toFollowUserId);
            targetUser.followers.push(myId);
            await user.save();
            await targetUser.save();
            return res.status(200).json({
                success:true,
                message:"Followed successfully",
            })
        }


    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Follow Or Unfollow , Internal Server Error",
        })
    }
}

























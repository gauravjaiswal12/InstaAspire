const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.isAuthenticated = async (req,res,next)=>{
    try{
        const token = req.cookies.token
           || req.body.token
           || req.header("Authorization")?.replace("Bearer ", "");
        if(!token){
            return res.status(401).json({
                success:false,
                message:"No token provided"
            })
        }
        const decode=await jwt.verify(token,process.env.JWT_SECRET);
        if(!decode){
            return res.status(401).json({
                success:false,
                message:"token could not be verified"
            })
        }
        console.log(decode);
        req.id = decode.userId;
        next();
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Not authorized"
        })
    }
}
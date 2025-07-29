const Conversation=require('../models/Conversation');
const Message=require('../models/Message');
const {getReceiverSocketId} = require("../socket/socket");
const {io} = require("../socket/socket");
//for chatting
exports.sendMessage = async (req,res) => {
    try{
        const senderId=req.id;
        const receiverId=req.params.id;
        const {message}=req.body;
        console.log("the message is ",message);
        if(!message){
            return res.status(400).json({
                success:false,
                message:"Please add a message"
            })
        }

        let conversation=await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        }).populate('messages');
        //establish the conversation if not started yet
        if(!conversation){
            conversation=await Conversation.create({
                participants:[senderId,receiverId]
            }).populate('messages') ;
        }
        const newMessage=await Message.create({
            senderId:senderId,
            receiverId:receiverId,
            message:message
        });
        if(newMessage){
            conversation.messages.push(newMessage._id);
        }
        await conversation.save();
        await newMessage.save();

        //implement socket io for real time updates
        //one to one chat
        const receiverSocketId=getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage',newMessage);

        }


        return res.status(201).json({
            success:true,
            message:"Message sent successfully",
            newMessage:newMessage,
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while sending message, Internal Server Error"
        })
    }
}

//get messages
exports.getMessage=async (req,res)=>{
    try{
        const senderId=req.id;
        const receiverId=req.params.id;
        const conversation=await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        }).populate('messages');
        if(!conversation){
            return res.status(200).json({
                success:false,
                message:[]
            })
        }
        // const messages=await Message.find({
        //     $or:[
        //         {senderId:senderId,receiverId:receiverId},
        //         {senderId:receiverId,receiverId:senderId}
        //     ]
        // }).sort({createdAt:-1});
        // return res.status(200).json({
        //     success:true,
        //     messages:messages
        // })
        return res.status(200).json({
            success:true,
            messages:conversation?.messages,
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while getting messages, Internal Server Error"
        })
    }
}
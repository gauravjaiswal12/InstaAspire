const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        default: ''
    },
    mediaUrl: { // ✅ Holds the Cloudinary URL (image or video)
        type: String,
        required: true
    },
    mediaType: { // ✅ Must match the controller: either 'image' or 'video'
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        }
    ],
}, { timestamps: true }); // Optional: adds createdAt & updatedAt

module.exports = mongoose.model('Post', postSchema);


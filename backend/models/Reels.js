const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
    videoUrl: {
        type: String,
        required: true
    },
    // The image cover for the Reel shown in grids. Crucial for performance.
    thumbnailUrl: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // The heart of Reels. How many times it has been played.
    viewCount: {
        type: Number,
        default: 0
    },
    // Music and sound are essential for Reels.
    audio: {
        type: {
            name: String, // "Original Audio" or "Song Title"
            artist: String, // "Author's Username" or "Artist Name"
            audioUrl: String, // Optional: URL to the licensed audio file
        },
        default: null
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }]
}, { timestamps: true });

// Index for fetching all reels efficiently
reelSchema.index({ createdAt: -1 });
reelSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Reel', reelSchema);
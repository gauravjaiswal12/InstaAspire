// scripts/migratePosts.js

require("dotenv").config(); // Load .env file
const mongoose = require("mongoose");
const Post = require("../models/Post"); // Adjust path as needed

const MONGODB_URI = process.env.MONGO_URI;

const migrate = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");

        const result = await Post.updateMany(
            {
                mediaUrl: { $exists: false },
                image: { $exists: true }
            },
            [
                {
                    $set: {
                        mediaUrl: "$image",
                        mediaType: "image"
                    }
                },
                {
                    $unset: "image"
                }
            ]
        );

        console.log(`🔧 Migration complete. Modified ${result.modifiedCount} documents.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();

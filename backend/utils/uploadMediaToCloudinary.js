const cloudinary = require('cloudinary').v2;

/**
 * Uploads a media file (image or video) to Cloudinary.
 * This is the final, robust version that handles both images and HLS videos.
 */
exports.uploadMediaToCloudinary = async (file, folder, height, quality) => {
    const isVideo = file.mimetype.startsWith("video/");
    const options = {
        folder,
        resource_type: "auto",
    };

    if (isVideo) {
        // Use "full_hd" to generate a full bitrate ladder for ABR.
        console.log("\n\n🔥🔥🔥 INSIDE THE 'full_hd' VIDEO UPLOAD BLOCK 🔥🔥🔥\n\n");
        options.eager = [
            { streaming_profile: "full_hd", format: "m3u8" },
        ];
        // Force the function to wait for the HLS versions to be ready.
        options.eager_async = false;
    } else {
        // Apply transformations only for images.
        if (height) options.height = height;
        if (quality) options.quality = quality;
    }

    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, options);
        console.log("✅ Cloudinary upload result:", result);

        // --- THIS IS THE KEY MODIFICATION ---
        // Create a single, reliable URL variable for both images and videos.
        let finalMediaUrl;

        if (isVideo) {
            // For videos, prioritize the master playlist URL.
            // 1. `playback_url` is the primary field for this.
            // 2. Fall back to the `eager` array just in case.
            // 3. Fall back to the original .mp4 if all else fails.

            finalMediaUrl = (result.eager?.[0]?.secure_url) || result.playback_url || result.secure_url;
        } else {
            // For images, the URL is always in `secure_url`.
            finalMediaUrl = result.secure_url;
        }
        console.log("➡️ Final URL being returned:", finalMediaUrl);

        // Return a clean, consistent object.
        return {
            mediaUrl: finalMediaUrl, // The single URL to be saved in the database
            resource_type: result.resource_type,
            public_id: result.public_id,
        };

    } catch (error) {
        console.error("❌ Cloudinary Upload Error:", error);
        throw new Error("Failed to upload media to Cloudinary.");
    }
};

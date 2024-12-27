import mongoose, {mongo, Schema} from "mongoose";

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,   //Cloudinary link
            required: [true, "Video is required"],
        },
        thumbnail:{
            type: String,   //Cloudinary link
            required: [true, "Thumbnail is required"],
        },
        title:{
            type: String,
            required: true
        },
        description:{
            type: String,
            required: true
        },
        duration:{
            type: Number,
            required: true
        },
        views:{
            type: Number,
            default: 0
        },
        isPublished:{
            type: Boolean,
            default: true
        },
        owner:{
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
        

    },{timestamps: true}
)


export const Video = mongoose.model("Video", videoSchema)
import mongoose, {mongo, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,   //Cloudinary link
            required: [true, "Video is required"],
        },
        videoFilePublicId:{
            type: String,
            required: true
        },
        thumbnail:{
            type: String,   //Cloudinary link
            required: [true, "Thumbnail is required"],
        },
        thumbnailPublicId:{
            type: String,
            required: true
        },
        title:{
            type: String,
            required: true
        },
        description:{
            type: String
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

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)
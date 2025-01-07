import mongoose, {mongo, Mongoose, Schema} from "mongoose";


const likeSchema = new mongoose.Schema(
    {
        video:{
            type: mongoose.Types.ObjectId,
            ref: "Video"
        },
        comment:{
            type: mongoose.Types.ObjectId,
            ref: "Comment"
        },
        likedBy:{
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)


export const Like = mongoose.model("Like", likeSchema)
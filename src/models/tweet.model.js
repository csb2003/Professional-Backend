import mongoose, {mongo, Schema} from "mongoose";


const tweetSchema = new mongoose.Schema(
    {
        content:{
            type : String,
            required: true
        },
        owner:{
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const Tweet = mongoose.model("Tweet", tweetSchema)

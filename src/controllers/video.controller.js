import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js"
import { Video } from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import mongoose, { Mongoose } from "mongoose";


const uploadVideo = asyncHandler( async (req,res) => {
    // const videoLocalPath = req.files?.video[0]?.path 
})
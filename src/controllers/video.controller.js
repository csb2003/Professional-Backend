import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js"
import { Video } from "../models/video.model.js"
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import mongoose, { isValidObjectId, Mongoose } from "mongoose";


const getAllVideos = asyncHandler( async (req,res) => {
    //TODO: get all videos based on query, sort, pagination
    const {page = 1, limit= 10, query, sortBy, sortType, userId} = req.query
    //GET /your-endpoint?page=2 & limit=5 & query=admin & sortBy=createdAt & sortType=desc & userId=5678

    const videos = await Video.aggregate([
        {
            $match: {
                $or:[ {title: {$regex: query, $options: "i"}}, {description: {$regex: query, $options: "i"}} ]
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "createdBy"
            }
        },
        {
            $sort: {
                [sortBy]: sortType === 'asc' ? 1 : -1   //newest videos first (createdAt from timestamps)
            }   
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        },
        {
            $project:{
                videoFile: 1,
                thumbnail: 1,
                description: 1,
                duration:1,
                views:1,
                createdBy:{
                    fullName: 1,
                    username: 1,
                    avatar: 1
                }
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,videos, "Fetched required videos"))

})

const publishAvideo = asyncHandler( async (req,res) => {
    // TODO: get video, upload to cloudinary, create video
    const {title, description} = req.body
    if(!title || !description){
        throw new ApiError(400, "Title and description are needed")
    }

    const videoLocalPath = req.files?.videoFile[0].path
    const videoFile = await uploadOnCloudinary(videoLocalPath)

    if(!videoFile.url){
        throw new ApiError(400, "Error while uploading video")
    }

    const thumbnailLocalPath = req.files?.thumbnail[0].path
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnailFile.url){
        throw new ApiError(400, "Thumbnail not found")
    }

    const video = await Video.create({
        videoFile,
        videoFilePublicId: videoFile.public_id,
        thumbnail,
        thumbnailPublicId: thumbnailFile.public_id,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, video ,"Video Published Successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)

    return res
    .status(200)
    .json(
        200,
        new ApiResponse(200,video,"Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const {title, description} = req.body
    const newthumbnailLocalPath = req.file?.path

    if (!newthumbnailLocalPath){
        throw new ApiError(400, "New thumbnail not found")
    }

    const video = await Video.findById(videoId)
    if (!video){
        throw new ApiError(400, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video")
    }
    
    const newthumbnail = await uploadOnCloudinary(newthumbnailLocalPath)
    if (!newthumbnail){
        throw new ApiError(400, "New thumbnail not uploaded")
    }

    const oldThumbnailDeleteResponse = await deleteFromCloudinary(video.thumbnailPublicId)
    if (!oldThumbnailDeleteResponse) {
        // Log the error but don't throw it since we already have the new thumbnail
        console.log("Warning: Could not delete old thumbnail from cloudinary")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                thumbnail: newthumbnail,
                thumbnailPublicId: newthumbnail.public_id
            }
        },
        {
            new:true
        }
    ).select("-videoFilePublicId -thumbnailPublicId")
    
    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const deleteResponse = Video.findByIdAndDelete(videoId)
    if (!deleteResponse) {
        // Log the error but don't throw it since we already have the new thumbnail
        throw new ApiError(400, "couldnt delete video")
    }
    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAvideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
}
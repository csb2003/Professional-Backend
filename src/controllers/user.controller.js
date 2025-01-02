import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessRefreshTokens = async (userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessTokens()
        const refreshToken = user.generateRefreshTokens()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave : false})  // do not perform validation, only save refresh token in db
        
        return { accessToken,refreshToken} 

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler ( async (req, res) => {
    //1. recieve user data from frontend/postman
    //2. check if user exists already or not (from unique fields)
    //3. check for images,avatar (all required fields must be present)
    //4. upload files to cloudinary (via multer)
    //5. create an object of all the user data for sending it to mongodb
    //6. in response mongo returns the same object containing all details, thus remove password and refresh tokens
    //7. check for user creation

    // 1. Receive user data from frontend/Postman
    const {fullname, email,password,username} = req.body
    console.log(fullname, email,password,username)

    // 2. Validate required fields
    if (
        [fullname,email,password,username].some( (field)=>field?.trim() === "" )
    ){
        throw new ApiError(400, "All fields are required")  
    }

    // 3. Check if user already exists
    const existedUser = await User.findOne({
        $or:[{ username }, { email }]
    })
    if (existedUser){
        throw new ApiError(400, "User already exists")
        
    }

    //4.  check for images,avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    if (!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    
    //5. upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    
    if (!avatar) {
        throw new ApiError(400, "Failed to upload avatar to Cloudinary");
    }
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // if (!coverImage) {
    //     throw new ApiError(400, "Failed to upload cover image to Cloudinary");
    // }
    


    //6. create an object of all the user data for sending it to mongodb
    const user = await User.create({
        fullname,
        email,
        password,
        username,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    //7. in response mongo returns the same object containing all details, thus remove password and refresh tokens
    const createdUser = await User.findById(user._id).select("-password -refreshTokens")

    if (!createdUser) {
        throw new ApiError(400,"Something went wrong while registering user")
    }

    //give final response
    return res.status(201).json(
        new ApiResponse(201,createdUser,"User registered successfully!")
    )
})

const loginUser = asyncHandler( async (req,res) => {
    const { email, username, password } = req.body
    if(!(email || username)){
        throw new ApiError(400,"email or username required")
    }
    
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    // user variable doesnt have refresh token in it now

    if (!user){
        throw new ApiError(404,"User doesn't exits")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) throw new ApiError(401, "Invalid password")

    // user variable doesnt have refresh token in it now
    const{ accessToken, refreshToken} = await generateAccessRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select('-password -refreshTokens')

    const options ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: accessToken,refreshToken,loggedInUser
            },
            "User logged in successfully"
        )
    )
}) 

const logoutUser = asyncHandler( async (req,res) => {
    //The browser sends a POST /logout request.
    //Cookies (accessToken and refreshToken) are included in the request.
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options ={
        httpOnly: true, //Ensures cookies can't be accessed via JavaScript (security)
        secure: true    // Ensures cookies are only sent over HTTPS.
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )
    )
})

const refreshAccessToken = async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    } 

    try {
        //verify the recieved token (which comes in encoded form)
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if(!user) throw new apiErrors(401, "Invalid refresh token")
        
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options= {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken,options)
        .cookie("refreshToken", newrefreshToken,options)
        .json(
            new apiResponse
            (
                200,
                {
                    accessToken, refreshToken : newrefreshToken
                },
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }
}


export { registerUser,loginUser,logoutUser,refreshAccessToken }
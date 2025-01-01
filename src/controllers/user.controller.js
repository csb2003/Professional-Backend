import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"

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


export { registerUser }
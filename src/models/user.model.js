import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      default: 'user',
      unique: true,
      lowecase: true,
      trim: true,//useful in searching in database (IMP)
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowecase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      index: true,   //useful in searching in database (IMP)
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      unique: true,
      trim: true,
    },
    avatar: {
      type: String, // link will be stored (of Cloudinary)
      required: [true, 'Avatar is required'],
    },
    coverImage: {
      type: String, // link will be stored (of Cloudinary)
    },
    watchHistory: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Video',
      },
    ],
    refreshTOkens: {
      type: String,
    },
  },
  { timestamps: true }
);

//mongoose middleware (pre)--
// used to perform actions on the recieved data, just before it is being saved (hashing password before saving, etc)
userSchema.pre("save", async function(next){
    // dont use callbacks here

    if (this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10)
        next()
    }
})

//password comparision-
userSchema.methods.isPasswordCorrect = async function(){
    return await bcrypt.compare(password, this.password)
}

// //generating access tokens:
// Purpose:
// Short-lived token used to authenticate API requests.
// Contains user information (usually in the form of a payload) that the server can verify.
// Helps ensure that only authenticated users can access specific resources or endpoints.
userSchema.methods.generateAccessTokens = function(){
    jwt.sign(
        {//payload
            _id: this.id,
            username: this.username,
            fullname: this.fullname,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET, // secret key
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY //expiry
        }
    )
}

//generating refresh tokens:

userSchema.methods.generateRefreshTokens = function(){
    jwt.sign(
        {
            _id : this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);

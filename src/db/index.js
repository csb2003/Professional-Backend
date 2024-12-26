import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"
import { asyncHandler  } from "../utils/asyncHandler.js";

// export const connectDB = async ()=>{
//     try {
//         const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log(`\n Mongodb connected !! DB HOST: ${connectionInstance.connection.host}`)

//     } catch (error) {
//         console.error("ERROR: ", error)
//         process.exit(1)
//     }
// }

// using middleware style setup to make code cleaner-
export const connectDB = asyncHandler( async (req,res,next)=>{
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`\n Mongodb connected !! DB HOST: ${connectionInstance.connection.host}`)
})


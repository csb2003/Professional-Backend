import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"



// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
    

const uploadOnCloudinary = async (localfilePath) => {
    try {
        if (!localfilePath) return null

        //upload file on cloudinary

        const response = await cloudinary.uploader.upload(localfilePath,{resource_type: 'auto'})
        fs.unlinkSync(localfilePath)
        //file uploaded successfull
        console.log("file uploaded successfully on cloudinary",response.url)
        return response
    } catch (error) {
        //file is present on local server, but not uploaded on cloudinary
        //thus, for safety, remove it from local server
        fs.unlinkSync(localfilePath)
        return null
    }
}
   

export {uploadOnCloudinary}
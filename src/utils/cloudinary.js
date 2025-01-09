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
        console.log("file uploaded successfully on cloudinary",response.url,response.public_id)
        return {
            url: response.url,
            public_id: response.public_id
        }
    } catch (error) {
        //file is present on local server, but not uploaded on cloudinary
        //thus, for safety, remove it from local server
        fs.unlinkSync(localfilePath)
        return null
    }
}

const deleteFromCloudinary = async(public_id)=>{
    if (!localfilePath) return null

    try {
        const response = await cloudinary.delete_resources(public_id)
        console.log("File deleted successfully from cloudinary", response)
        return response
    } catch (error) {
        console.log("Error while deleting file from cloudinary : ", error);
        return null;
    }
}
export {uploadOnCloudinary, deleteFromCloudinary}
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";


//! configure cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

//! Create an instance of the cloud-storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    params: {
        folder: 'social_blog_app',
        format: 'webp',
        transformation: [{width: 500, height: 500, crop: 'limit'}]
    }
})

export default storage;
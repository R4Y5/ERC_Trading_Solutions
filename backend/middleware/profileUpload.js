const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary-v2')
const path = require('path')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'erc-trading/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [
            {
                width: 500,
                height: 500,
                crop: 'limit',
                quality: 'auto',
                fetch_format: 'auto'
            }
        ]
    }
})

const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png']
    const allowedMimeTypes = ['image/jpeg', 'image/png']

    const extension = path.extname(file.originalname).toLowerCase()

    if (
        !allowedExtensions.includes(extension) ||
        !allowedMimeTypes.includes(file.mimetype)
    ) {
        return cb(
            new Error('Only JPG, JPEG, and PNG images are allowed.')
        )
    }

    cb(null, true)
}

const profileUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter
})

module.exports = profileUpload

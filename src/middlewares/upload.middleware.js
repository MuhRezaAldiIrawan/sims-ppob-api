const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Check if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

// Storage configuration - use Cloudinary for production, local for development
const storage = isProduction ? 
    new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'profile_pictures', // Folder name in Cloudinary
            allowed_formats: ['jpeg', 'jpg', 'png'],
            transformation: [
                { width: 500, height: 500, crop: 'limit' }, // Resize image
                { quality: 'auto' } // Auto optimize
            ],
            public_id: (req, file) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                return 'profile-' + uniqueSuffix;
            }
        }
    }) :
    multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format Image tidak sesuai'), false);
    }
};

// Upload configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 102400 // 100KB default
    },
    fileFilter: fileFilter
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 102,
                message: 'File size exceeds 100KB',
                data: null
            });
        }
    }

    if (err.message === 'Format Image tidak sesuai') {
        return res.status(400).json({
            status: 102,
            message: err.message,
            data: null
        });
    }

    next(err);
};

module.exports = { upload, handleUploadError };
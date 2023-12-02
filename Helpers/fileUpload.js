const multer = require('multer');

const fileUpload = (req, res, next) => {
    multer({
        storage: multer.diskStorage({}),
        limits: {
            fileSize: 1024 * 1024 * 3, // 3MB
        },
        fileFilter: (req, file, cb) => {
            if (
                file.mimetype === 'image/png' ||
                file.mimetype === 'image/jpg' ||
                file.mimetype === 'image/jpeg' ||
                file.mimetype === 'image/gif' ||
                file.mimetype === 'image/svg+xml' ||
                file.mimetype === 'video/mp4' ||
                file.mimetype === 'audio/mpeg' ||
                file.mimetype === 'video/webm'
            ) {
                return cb(null, true);
            } else {
                const error = new Error('Only .png, .jpg, .gif, .svg ,.jpeg , .mp4 , mp3 or .webm format allowed.');
                error.status = 400;
                return cb(error);
            }
        },
    }).fields([{
        name: 'img_video'
    }])(req, res, (err) => {
        if (err) {
            // Handle the error by sending it as a response
            return res.status(err.status || 500).json({
                status: "Fail",
                message: err.message
            });
        }
        next(); // No error, continue to the next middleware
    });
};

module.exports = fileUpload;
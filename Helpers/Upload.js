const multer = require('multer');

const uploads = (req, res, next) => {
  multer({
    limits: {
      fileSize: 1000000, // 1MB
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'||
        file.mimetype === 'image/gif' ||
        file.mimetype === 'image/svg+xml'
      ) {
        return cb(null, true);
      } else {
        const error = new Error('Only .png, .jpg, .gif, .svg or .jpeg format allowed.');
        error.status = 400;
        return cb(error);
      }
    },
  }).fields([{ name: 'banner'}, { name: 'image'}])(req, res, (err) => {
    if (err) {
      // Handle the error by sending it as a response
      return res.status(err.status || 500).json({status:"Fail",message:err.message});
    }
    next(); // No error, continue to the next middleware
  });
};

module.exports = uploads;
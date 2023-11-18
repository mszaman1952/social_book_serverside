const multer = require('multer');
const path = require('path');

const MAX_FILE_SIZE = 1024 * 1024 * 2; // 2MB
// const MAX_FILE_SIZE = 1024 * 200; // 200KB
const ALLOWED_FILE_TYPES = [
  'jpg',
  'jpeg',
  'png',
  "mp4",
  "PNG",
  'JPG',
  "JPEG",
  "gif",
  "GIF"
];
const UPLOAD_DIR = path.join(__dirname, '../public/');

const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname);
  if (!ALLOWED_FILE_TYPES.includes(extname.substring(1))) {
    const error = new Error('File type not allowed');
    return cb(error);
  } 
  cb(null, true);
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_DIR)
    },
    filename: function (req, file, cb) {
      const img = Date.now() + '-' + file.originalname;
      cb(null, img)
    }
  });
  
  const postUpload = multer({ 
    storage, 
    limits : {fileSize : MAX_FILE_SIZE},
    fileFilter
  })
  
module.exports = postUpload;

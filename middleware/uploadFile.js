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
    destination: function(req, file, cb) {
        cb(null, UPLOAD_DIR)
    },
    filename: function(req, file, cb) {
        const img = Date.now() + '-' + file.originalname;
        cb(null, img)
    }
});

const postUpload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter
});

// for comment ==============================
const MAX_COMMENT_FILE_SIZE = 1024 * 1024 * 2;
const ALLOWED_COMMENT_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif',"JPG","JPEG",,"PNG","GIF", "mp4"]; 

const COMMENT_UPLOAD_DIR = path.join(__dirname, '../public/comment_uploads/');

const commentFileFilter = (req, file, cb) => {
    const extname = path.extname(file.originalname);

    if (ALLOWED_COMMENT_FILE_TYPES.includes(extname.substring(1))) {
        // Allowed file type
        cb(null, true);
    } else {
        // Unsupported file type
        const error = new Error('File type not allowed for comments');
        return cb(error);
    }
};

const commentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, COMMENT_UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + '-' + file.originalname;
        cb(null, filename);
    },
});

const commentUpload = multer({
    storage: commentStorage,
    limits: {
        fileSize: MAX_COMMENT_FILE_SIZE,
    },
    fileFilter: commentFileFilter,
});

// for comment reply ============================================

const MAX_REPLY_FILE_SIZE = 1024 * 1024 * 2;
const ALLOWED_REPLY_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'mp4',"JPG","JPEG","PNG","GIF"];

const REPLY_UPLOAD_DIR = path.join(__dirname, '../public/reply_uploads/');

const replyFileFilter = (req, file, cb) => {
    const extname = path.extname(file.originalname);

    if (ALLOWED_REPLY_FILE_TYPES.includes(extname.substring(1))) {
        // Allowed file type
        cb(null, true);
    } else {
        // Unsupported file type
        const error = new Error('File type not allowed for reply comments');
        return cb(error);
    }
};

const replyStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, REPLY_UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + '-' + file.originalname;
        cb(null, filename);
    },
});

const replyUpload = multer({
    storage: replyStorage,
    limits: {
        fileSize: MAX_REPLY_FILE_SIZE,
    },
    fileFilter: replyFileFilter,
});

// nested reply file upload =============================
const MAX_NESTED_REPLY_FILE_SIZE = 1024 * 1024 * 2;
const ALLOWED_NESTED_REPLY_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'JPG', 'JPEG', 'PNG', 'GIF'];

const NESTED_REPLY_UPLOAD_DIR = path.join(__dirname, '../public/nested_reply_uploads/');

const nestedReplyFileFilter = (req, file, cb) => {
    const extname = path.extname(file.originalname);

    if (ALLOWED_NESTED_REPLY_FILE_TYPES.includes(extname.substring(1))) {
        // Allowed file type
        cb(null, true); 
    } else {
        // Unsupported file type
        const error = new Error('File type not allowed for nested replies');
        return cb(error);
    }
};

const nestedReplyStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, NESTED_REPLY_UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + '-' + file.originalname;
        cb(null, filename);
    },
});

const nestedReplyUpload = multer({
    storage: nestedReplyStorage,
    limits: {
        fileSize: MAX_NESTED_REPLY_FILE_SIZE,
    },
    fileFilter: nestedReplyFileFilter,
});


module.exports = {postUpload,commentUpload, replyUpload, nestedReplyUpload};

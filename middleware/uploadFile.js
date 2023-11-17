// // uploadFile.js
// const multer = require('multer');
// const path = require('path');

const MAX_FILE_SIZE = 1024 * 1024 * 2; // 2MB
// const MAX_FILE_SIZE = 1024 * 200; // 200KB
// const ALLOWED_FILE_TYPES = [
//   'jpg',
//   'jpeg',
//   'png',
// ];
// const UPLOAD_DIR = path.join(__dirname, 'public/images/users');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, UPLOAD_DIR);
//   },
//   filename: function (req, file, cb) {
//     const extname = path.extname(file.originalname);
//     cb(
//       null,
//       Date.now() + '-' + file.originalname.replace(extname, '') + extname
//     );
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const extname = path.extname(file.originalname);
//   if (!ALLOWED_FILE_TYPES.includes(extname.substring(1))) {
//     const error = new Error('File type not allowed');
//     console.log('error: ', error);
//     return cb(error);
//   }
//   cb(null, true);
// };

// const upload = multer({
//   storage,
//   limits: { fileSize: MAX_FILE_SIZE },
//   fileFilter,
// });

// module.exports = upload;

const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/')
    },
    filename: function (req, file, cb) {
      const img = Date.now() + '-' + file.originalname;
      cb(null, img)
    }
  });
  
  const upload = multer({ 
    storage, 
    limits : {fileSize : MAX_FILE_SIZE}
  })
  // const upload = multer({dest : "../public"})

// app.post('/register',upload.single('image'), async(req, res) => {
//     try {
        
//         const newUser = await User({name : req.body.name, image: req.file.filename}).save();
//         res.status(201).json({
//             status : "Success",
//             newUser
//         })
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message  :"Something Worng",
//         })
//     }
// })

module.exports = upload;

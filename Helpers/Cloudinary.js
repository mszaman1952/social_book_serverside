const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dpurfb0ia',
    api_key: '555598888173696',
    api_secret: 'x4PblpAuqFbo3AaNWb74GzAWSXg'
});

module.exports = cloudinary;
const { v2: cloudinary } = require('cloudinary');

const requiredVariables = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

function isConfigured() {
    return requiredVariables.every((name) => Boolean(process.env[name]));
}

if (isConfigured()) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
}

module.exports = { cloudinary, isConfigured };

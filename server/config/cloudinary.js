const cloudinary = require('cloudinary').v2;

const cleanEnv = (val) => (typeof val === 'string' ? val.trim().replace(/^["']|["']$/g, '') : val);

cloudinary.config({
  cloud_name: cleanEnv(process.env.CLOUDINARY_CLOUD_NAME),
  api_key: cleanEnv(process.env.CLOUDINARY_API_KEY),
  api_secret: cleanEnv(process.env.CLOUDINARY_API_SECRET),
});

module.exports = cloudinary;
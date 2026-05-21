const { v2: cloudinary } = require('cloudinary');
const stream = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'ai_score',
        ...options
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      }
    );

    const readable = new stream.PassThrough();
    readable.end(buffer);
    readable.pipe(uploadStream);
  });

module.exports = {
  uploadBuffer
};

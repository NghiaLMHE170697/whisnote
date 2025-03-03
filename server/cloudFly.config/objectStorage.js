const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");

// CloudFly configuration
const s3Client = new S3Client({
    region: "hn",
    endpoint: "https://s3.cloudfly.vn",
    credentials: {
        accessKeyId: process.env.OBJECT_STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.OBJECT_STORAGE_SECRET_KEY,
    },
});

// Bucket name
const BUCKET_NAME = "post-image";

// Multer setup for handling multiple file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 3 } // Limit to 3 files
});

// Simplified image upload function
const uploadImageFile = async (file, fileId, bucketName) => {
    if (!file || !file.buffer || file.buffer.length === 0) {
      return {
        status: 404,
        message: "File not found",
      };
    }
  
    try {
      const fileKey = fileId.toString();
      const fileBuffer = file.buffer;
  
      const uploadParams = {
        Bucket: bucketName,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      };
  
      await s3Client.send(new PutObjectCommand(uploadParams));
      const fileUrl = `https://${bucketName}.s3.cloudfly.vn/${fileKey}`;
      
      return {
        status: 200,
        message: "Upload successful",
        url: fileUrl,
        fileName: file.originalname
      };
    } catch (err) {
      console.error("Upload Error:", err);
      return {
        status: 500,
        error: "Failed to upload image",
      };
    }
  };
  
  // Add this to module.exports
  module.exports = {
    // ... other existing exports ...
    uploadImageFile
  };
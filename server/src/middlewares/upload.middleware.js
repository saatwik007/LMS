const multer = require('multer');

const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024; // mobile photos can be larger before compression

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'image/heic',
  'image/heif'
]);

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_UPLOAD_BYTES,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    console.log('[UPLOAD] incoming file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error(`Unsupported image type: ${file.mimetype}`));
    }
    return cb(null, true);
  }
});

function handleSingleImage(fieldName = 'image') {
  return (req, res, next) => {
    const uploadSingle = multerUpload.single(fieldName);

    uploadSingle(req, res, (error) => {
      console.log('[UPLOAD] body keys:', Object.keys(req.body || {}));
      console.log('[UPLOAD] file attached:', !!req.file);

      if (!error) return next();

      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ message: `Image too large. Max upload size is ${MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024)}MB.` });
        }
        return res.status(400).json({ message: `Upload error: ${error.code}` });
      }

      return res.status(400).json({ message: error.message || 'Invalid image file.' });
    });
  };
}

const profileImageUpload = handleSingleImage('image');
const postImageUpload = handleSingleImage('image');

module.exports = {
  MAX_IMAGE_UPLOAD_BYTES,
  profileImageUpload,
  postImageUpload
};
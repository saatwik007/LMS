const multer = require('multer');

const MAX_IMAGE_UPLOAD_BYTES = 3 * 1024 * 1024;

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg'
]);

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_UPLOAD_BYTES,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, or WEBP images are allowed.'));
    }
    return cb(null, true);
  }
});

function profileImageUpload(req, res, next) {
  const uploadSingle = multerUpload.single('image');

  uploadSingle(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'Image too large. Max upload size is 3MB.' });
      }
      return res.status(400).json({ message: 'Invalid upload request.' });
    }

    return res.status(400).json({ message: error.message || 'Invalid image file.' });
  });
}

module.exports = {
  MAX_IMAGE_UPLOAD_BYTES,
  profileImageUpload
};

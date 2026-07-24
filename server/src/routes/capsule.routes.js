const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { createCapsule, getFriendsCapsules, getUserCapsules, viewCapsule, getCapsuleMedia, deleteCapsule, preserveCapsule, likeCapsule, createCapsuleComment } = require('../controllers/Capsule.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ define upload here
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/capsules/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `capsule-${req.user.id}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = express.Router();

router.post('/capsulepost', protect, upload.single('media'), createCapsule);
router.get('/media/:fileId', getCapsuleMedia);
router.get('/feed', protect, getFriendsCapsules);
router.get('/user/:userId', protect, getUserCapsules);
router.post('/:id/view', protect, viewCapsule);
router.post(`/:id/like`, protect, likeCapsule);
router.post('/:id/preserve', protect, preserveCapsule);
router.post('/:id/capsulecomment', protect, createCapsuleComment);
router.delete('/:id', protect, deleteCapsule);

module.exports = router;
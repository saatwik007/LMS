// const { default: Capsule } = require('../../../client/codingo/src/components/Comments/CapsuleModal');
const Capsule = require('../models/capsule.model')
const User = require('../models/user.model');
const { uploadBufferToDrive } = require('../utils/driveUpload');
const fs = require('fs');
const HOUR = 60 * 60 * 1000;

const createCapsule = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const now = new Date();

    // Debug incoming request
    console.log(`[CAPSULE CREATE] user=${userId} filePresent=${!!req.file}`);

    if (!req.file) {
      console.error('[CAPSULE CREATE] no file attached in request');
      return res.status(400).json({ message: 'No media file uploaded' });
    }

    // ✅ read file from disk into buffer
    const fileBuffer = fs.readFileSync(req.file.path);

    const { fileId, publicUrl } = await uploadBufferToDrive(
      fileBuffer,
      req.file.originalname,
      req.file.mimetype          // ✅ mediaType from req.file
    );

    // ✅ clean up disk after uploading to Drive
    fs.unlinkSync(req.file.path);

    const capsule = await Capsule.create({
      user: userId,
      mediaFileId: fileId,
      mediaUrl: publicUrl,       // ✅ save publicUrl too
      mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      caption: req.body.caption || '',
      expiresAt: new Date(now.getTime() + 24 * HOUR),
      deleteAt: new Date(now.getTime() + 48 * HOUR),
    });

    res.status(201).json(capsule);
  } catch (err) {
    console.error('Create capsule error:', err);
    res.status(500).json({ message: err.message });
  }
};

const getFriendsCapsules = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;  // ✅ fix

    const user = await User.findById(userId).select('friends');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const capsules = await Capsule.find({
      user: { $in: [...user.friends, userId] },  // ✅ use userId not req.user._id
      expiresAt: { $gt: new Date() },
    })
      .populate('user', 'username profilePic')
      
      .sort({ createdAt: -1 });

    // Debug: surface basic diagnostics to server logs to help client-side debugging
    try {
      console.log(`[CAPSULES] fetched ${capsules.length} capsules for user ${userId}`);
      if (capsules.length > 0) console.log('[CAPSULES] sample:', { id: capsules[0]._id, mediaFileId: capsules[0].mediaFileId, mediaUrl: capsules[0].mediaUrl });
    } catch (logErr) {
      console.warn('[CAPSULES] logging failure', logErr?.message || logErr);
    }

    // Ensure every capsule has a usable mediaUrl for older records that only
    // stored `mediaFileId`. Also normalize profilePic to an absolute URL when
    // served from the uploads folder.
    const processed = capsules.map((c) => {
      const obj = typeof c.toObject === 'function' ? c.toObject() : { ...c };
      if (!obj.mediaUrl && obj.mediaFileId) {
        obj.mediaUrl = `https://drive.google.com/uc?id=${obj.mediaFileId}`;
      }
      if (obj.user && obj.user.profilePic && typeof obj.user.profilePic === 'string') {
        if (!obj.user.profilePic.startsWith('http')) {
          // Build absolute URL for uploads stored on the server
          obj.user.profilePic = `${req.protocol}://${req.get('host')}${obj.user.profilePic}`;
        }
      }
      return obj;
    });

    res.json(processed);
  } catch (err) {
    console.error('getFriendsStories error:', err);  // ✅ add log to see exact error
    res.status(500).json({ message: err.message });
  }
};

const getUserCapsules = async (req, res) => {
  try {
    const { userId } = req.params;
    const viewerId = req.user._id;

    const profileUser = await User.findById(userId).select("isPrivate friends");
    if (!profileUser) return res.status(404).json({ message: "User not found" });

    const isOwner = String(userId) === String(viewerId);
    const isFriend = profileUser.friends.some((f) => String(f) === String(viewerId));

    if (profileUser.isPrivate && !isOwner && !isFriend) {
      return res.status(403).json({ message: "This account is private" });
    }

    const stories = await Capsule.find({ user: userId, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 });

    // Normalize older records to include mediaUrl when missing
    const processed = stories.map((c) => {
      const obj = typeof c.toObject === 'function' ? c.toObject() : { ...c };
      if (!obj.mediaUrl && obj.mediaFileId) {
        obj.mediaUrl = `https://drive.google.com/uc?id=${obj.mediaFileId}`;
      }
      return obj;
    });

    res.json(processed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const viewCapsule = async (req, res) => {
  try {
    await Capsule.findByIdAndUpdate(req.params.id, { $addToSet: { viewers: req.user._id } });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createCapsule,
  viewCapsule,
  getUserCapsules,
  getFriendsCapsules
}
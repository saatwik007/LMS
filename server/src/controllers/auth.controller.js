const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');
const { checkAndAwardBadges } = require('./badge.controller');

const PROFILE_PICS_DIR = path.join(__dirname, '..', '..', 'uploads', 'profile-pics');
const MAX_PROCESSED_IMAGE_BYTES = 450 * 1024;

function buildPublicImageUrl(req, fileName) {
  const explicitBase = process.env.PUBLIC_API_URL;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const inferredBase = `${protocol}://${req.get('host')}`;
  const base = (explicitBase || inferredBase).replace(/\/$/, '');
  return `${base}/uploads/profile-pics/${fileName}`;
}

function getUploadedProfileImageFilePath(profilePic) {
  if (!profilePic || typeof profilePic !== 'string') {
    return null;
  }

  const match = profilePic.match(/\/uploads\/profile-pics\/([^/?#]+)/);
  if (!match?.[1]) {
    return null;
  }

  const fileName = path.basename(match[1]);
  return path.join(PROFILE_PICS_DIR, fileName);
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

function buildUserPayload(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic || '',
    bio: user.bio || '',
    totalXp: user.totalXp || 0,
    level: user.level || 1,
    streakCount: user.streakCount || 0,
    notifications: (user.notifications || []).slice(-10).reverse(),
    friends: user.friends || [],
    friendRequests: user.friendRequests || []
  };
}

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function registerUser(req, res) {
  const { username, email, password } = req.body;

  try {
    const isUserAlreadyExist = await userModel.findOne({ $or: [{ username }, { email }] });
    if (isUserAlreadyExist) {
      return res.status(409).json({ message: 'Username or email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      notifications: [
        {
          title: 'Welcome to Codify',
          detail: 'Your learning dashboard is ready.'
        }
      ]
    });

    const token = signToken(user._id);
    res.cookie('token', token, getCookieOptions());

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: buildUserPayload(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function loginUser(req, res) {
  try {
    const { emailOrUsername, password } = req.body;
    const user = await userModel.findOne({
      $or: [
        { username: emailOrUsername },
        { email: emailOrUsername }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: buildUserPayload(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user: buildUserPayload(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { username, profilePic, bio } = req.body;
    const updates = {};

    if (typeof username === 'string' && username.trim()) {
      const normalized = username.trim();
      const existing = await userModel.findOne({ username: normalized, _id: { $ne: req.user.id } });
      if (existing) {
        return res.status(409).json({ message: 'Username is already taken.' });
      }
      updates.username = normalized;
    }

    if (typeof profilePic === 'string') {
      updates.profilePic = profilePic.trim();
    }

    if (typeof bio === 'string') {
      updates.bio = bio.trim().substring(0, 200); // Enforce max length
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid profile fields provided.' });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: buildUserPayload(updatedUser)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function uploadProfileImage(req, res) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'No image file uploaded. Use field name "image".' });
    }

    await fs.mkdir(PROFILE_PICS_DIR, { recursive: true });

    const qualitySteps = [78, 70, 62, 55, 48];
    let optimizedBuffer = null;

    for (const quality of qualitySteps) {
      const candidate = await sharp(req.file.buffer)
        .rotate()
        .resize({
          width: 640,
          height: 640,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality })
        .toBuffer();

      optimizedBuffer = candidate;
      if (candidate.length <= MAX_PROCESSED_IMAGE_BYTES) {
        break;
      }
    }

    if (!optimizedBuffer || optimizedBuffer.length > 1024 * 1024) {
      return res.status(413).json({
        message: 'Image is still too large after compression. Please upload a simpler image.'
      });
    }

    const fileName = `${req.user.id}-${Date.now()}.webp`;
    const absoluteFilePath = path.join(PROFILE_PICS_DIR, fileName);
    await fs.writeFile(absoluteFilePath, optimizedBuffer);

    const existingUser = await userModel.findById(req.user.id).select('profilePic');
    const previousUploadedFile = getUploadedProfileImageFilePath(existingUser?.profilePic);

    const profilePicUrl = buildPublicImageUrl(req, fileName);
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: { profilePic: profilePicUrl } },
      { new: true, runValidators: true }
    );

    if (previousUploadedFile && previousUploadedFile !== absoluteFilePath) {
      await fs.unlink(previousUploadedFile).catch(() => {});
    }

    return res.status(200).json({
      message: 'Profile image uploaded successfully.',
      user: buildUserPayload(updatedUser),
      imageSizeBytes: optimizedBuffer.length
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getNotifications(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select('notifications');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const notifications = (user.notifications || []).slice(-20).reverse();
    return res.status(200).json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function markNotificationRead(req, res) {
  try {
    const { notificationId } = req.params;
    const user = await userModel.findOneAndUpdate(
      { _id: req.user.id, 'notifications._id': notificationId },
      { $set: { 'notifications.$.isRead': true } },
      { new: true }
    ).select('notifications');

    if (!user) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.status(200).json({
      message: 'Notification updated.',
      notifications: (user.notifications || []).slice(-20).reverse()
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateStreak(req, res) {
  try {
    const { streakCount } = req.body;

    if (typeof streakCount !== 'number' || Number.isNaN(streakCount) || streakCount < 0) {
      return res.status(400).json({ message: 'streakCount must be a non-negative number.' });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: { streakCount: Math.floor(streakCount) } },
      { new: true }
    );

    // Check and award streak-milestone badges after streak update
    try {
      await checkAndAwardBadges(req.user.id);
    } catch (badgeError) {
      console.error('Badge check error after streak update:', badgeError);
    }

    // Refresh user to capture any XP/level/league changes from badge bonuses
    const refreshedUser = await userModel.findById(req.user.id);

    return res.status(200).json({
      message: 'Streak updated.',
      streakCount: refreshedUser.streakCount,
      user: buildUserPayload(refreshedUser)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function logoutUser(req, res) {
  res.clearCookie('token', getCookieOptions());
  return res.status(200).json({ message: 'Logout successful' });
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  uploadProfileImage,
  getNotifications,
  markNotificationRead,
  updateStreak,
  logoutUser
};
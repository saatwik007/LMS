const mongoose = require('mongoose');
const Course = require('../models/courses.model');
const UserProgress = require('../models/userProgress.model');
const User = require('../models/user.model');
const UserChallenge = require('../models/userChallenge.model');
const Challenge = require('../models/challenge.model');
const { checkAndAwardBadges } = require('./badge.controller');
const { XP_PER_LEVEL, computeLevel, computeLeague } = require('../utils/userStats');

const DEFAULT_COURSES = [
  {
      slug: 'python',
      title: 'Python',
      description: 'Python is used from automation to AI and data systems, with beginner-friendly syntax and a huge package ecosystem.',
    domain: 'Coding',
    level: 'Beginner',
      totalLectures: 19
  },
  {
      slug: 'java',
      title: 'Java',
      description: 'Java remains a backbone for enterprise systems, Android apps, and large distributed backends.',
    domain: 'Coding',
      level: 'Intermediate',
      totalLectures: 18
  },
  {
    slug: 'javascript',
      title: 'JavaScript',
      description: 'JavaScript powers modern frontend, full-stack web apps, and real-time product experiences.',
      domain: 'Coding',
    level: 'Beginner',
    totalLectures: 18
  },
  {
    slug: 'claude',
    title: 'Claude App Building',
      description: 'Learn prompt orchestration, tool-calling design, and production workflows for Claude-based apps.',
    domain: 'AI',
    level: 'Intermediate',
    totalLectures: 15
  },
  {
    slug: 'aws',
    title: 'AWS Cloud Essentials',
      description: 'Master foundational AWS services including compute, storage, IAM, and deployment patterns.',
    domain: 'Cloud',
    level: 'Intermediate',
    totalLectures: 16
    },
    {
      slug: 'cpp',
      title: 'C++',
      description: 'C++ is used where performance and system-level control are critical, from engines to infrastructure.',
      domain: 'Coding',
      level: 'Advanced',
      totalLectures: 21
    },
    {
      slug: 'azure',
      title: 'Azure Fundamentals',
      description: 'Understand Azure services for apps, data, identity, and secure cloud operations.',
      domain: 'Cloud',
      level: 'Beginner',
      totalLectures: 16
    },
    {
      slug: 'gcp',
      title: 'GCP Foundations',
      description: 'Build cloud-native systems with GCP services for compute, data, and analytics.',
      domain: 'Cloud',
      level: 'Beginner',
      totalLectures: 16
    },
    {
      slug: 'ml',
      title: 'Machine Learning Basics',
      description: 'Learn ML workflows from data preparation to model evaluation and deployment basics.',
      domain: 'ML',
      level: 'Intermediate',
      totalLectures: 20
    },
    {
      slug: 'dl',
      title: 'Deep Learning with PyTorch',
      description: 'Train, tune, and deploy deep learning models with practical PyTorch workflows.',
      domain: 'ML',
      level: 'Advanced',
      totalLectures: 22
    },
    {
      slug: 'nlp',
      title: 'NLP and LLM Apps',
      description: 'Build text and LLM applications using embeddings, retrieval, and evaluation pipelines.',
      domain: 'AI',
      level: 'Intermediate',
      totalLectures: 19
    },
    {
      slug: 'data',
      title: 'Data Analysis with Pandas',
      description: 'Learn practical data wrangling, exploration, and storytelling with Python and Pandas.',
      domain: 'Data',
      level: 'Beginner',
      totalLectures: 17
    },
    {
      slug: 'sql',
      title: 'SQL for Analytics',
      description: 'Master SQL querying, joins, windows, and dashboards for analytics workflows.',
      domain: 'Data',
      level: 'Beginner',
      totalLectures: 15
    },
    {
      slug: 'spark',
      title: 'Big Data with Spark',
      description: 'Process large datasets with Spark for ETL, analytics, and scalable data pipelines.',
      domain: 'Data',
      level: 'Advanced',
      totalLectures: 21
    },
    {
      slug: 'docker',
      title: 'Docker and Containers',
      description: 'Containerize applications and streamline delivery from development to production.',
      domain: 'DevOps',
      level: 'Intermediate',
      totalLectures: 15
    },
    {
      slug: 'k8s',
      title: 'Kubernetes in Practice',
      description: 'Run scalable and resilient workloads with Kubernetes orchestration patterns.',
      domain: 'DevOps',
      level: 'Advanced',
      totalLectures: 20
    },
    {
      slug: 'security',
      title: 'App Security Essentials',
      description: 'Learn practical secure coding, auth hardening, and threat-aware architecture.',
      domain: 'Security',
      level: 'Intermediate',
      totalLectures: 15
    },
    {
      slug: 'dsa',
      title: 'DSA Interview Prep',
      description: 'Sharpen problem-solving with core data structures and algorithm patterns.',
      domain: 'Coding',
      level: 'Intermediate',
      totalLectures: 24
  }
];

function toObjectId(id) {
  if (id instanceof mongoose.Types.ObjectId) return id;
  return new mongoose.Types.ObjectId(id);
}

function getTagFromProgress(progressPercent) {
  if (progressPercent >= 95) return 'Almost There';
  if (progressPercent > 0) return 'In Progress';
  return 'Practice';
}

function serializeCourse(progressDoc, courseDoc) {
  const lectureProgress = progressDoc.lectureProgress || [];
  const totalLectures = courseDoc.totalLectures || 1;
  const completedLectures = lectureProgress.filter((lecture) => lecture.completed).length;
  const progressPercent = Math.round((completedLectures / totalLectures) * 100);

  return {
    id: courseDoc.slug,
    courseId: String(courseDoc._id),
    title: courseDoc.title,
    description: courseDoc.description,
    domain: courseDoc.domain,
    level: courseDoc.level,
    progress: progressPercent,
    lessons: `${completedLectures}/${totalLectures} lessons`,
    tag: getTagFromProgress(progressPercent),
    status: progressDoc.status,
    totalPoints: progressDoc.totalPoints || 0,
    totalLectures,
    completedLectures,
    lastActivityAt: progressDoc.updatedAt
  };
}

// Helper to sync user's challenge progress
async function syncUserChallenges(userId) {
  const now = new Date();
  const activeChallenges = await Challenge.find({
    isActive: true,
    expiresAt: { $gt: now }
  });

  for (const challenge of activeChallenges) {
    const periodStart = challenge.startsAt;
    const periodEnd = challenge.expiresAt;

    let currentProgress = 0;

    switch (challenge.goalMetric) {
      case 'xp_earned': {
        const progressDocs = await UserProgress.find({ user: userId });
        progressDocs.forEach((doc) => {
          const periodLectures = (doc.lectureProgress || []).filter(
            (lec) => lec.completed && lec.completedAt >= periodStart && lec.completedAt <= periodEnd
          );
          currentProgress += periodLectures.reduce((sum, lec) => sum + (lec.points || 0), 0);
        });
        break;
      }

      case 'lessons_completed': {
        const progressDocs = await UserProgress.find({
          user: userId,
          updatedAt: { $gte: periodStart, $lte: periodEnd }
        });
        progressDocs.forEach((doc) => {
          const completed = (doc.lectureProgress || []).filter(
            (lec) => lec.completed && lec.completedAt >= periodStart && lec.completedAt <= periodEnd
          );
          currentProgress += completed.length;
        });
        break;
      }

      case 'courses_enrolled': {
        currentProgress = await UserProgress.countDocuments({
          user: userId,
          createdAt: { $gte: periodStart, $lte: periodEnd }
        });
        break;
      }

      default:
        continue;
    }

    currentProgress = Math.min(currentProgress, challenge.goalValue);

    await UserChallenge.findOneAndUpdate(
      { user: userId, challenge: challenge._id },
      {
        $set: {
          progress: currentProgress,
          completed: currentProgress >= challenge.goalValue,
          completedAt: currentProgress >= challenge.goalValue ? new Date() : null
        }
      },
      { upsert: true }
    );
  }
}

async function ensureDefaultCourses() {
  const operations = DEFAULT_COURSES.map((course) => ({
    updateOne: {
      filter: { slug: course.slug },
      update: { $set: course },
      upsert: true
    }
  }));

  await Course.bulkWrite(operations, { ordered: false });
}

async function recomputeAndPersistUserStats(userId) {
  const aggregate = await UserProgress.aggregate([
    { $match: { user: toObjectId(userId) } },
    { $group: { _id: null, totalXp: { $sum: '$totalPoints' } } }
  ]);

  const totalXp = aggregate[0]?.totalXp || 0;
  const level = computeLevel(totalXp);
  const league = computeLeague(totalXp);

  await User.findByIdAndUpdate(userId, { $set: { totalXp, level, league } });

  const currentLevelMinXp = (level - 1) * XP_PER_LEVEL;
  const nextLevelXp = level * XP_PER_LEVEL;
  const withinLevelXp = totalXp - currentLevelMinXp;
  const levelDelta = nextLevelXp - currentLevelMinXp || 1;
  const levelProgressPercent = Math.max(0, Math.min(100, Math.round((withinLevelXp / levelDelta) * 100)));

  return {
    totalXp,
    level,
    league,
    xpToNextLevel: nextLevelXp,
    levelProgressPercent
  };
}

async function getUserRank(userId, totalXp) {
  const usersWithHigherXp = await User.countDocuments({ totalXp: { $gt: totalXp } });
  const rank = usersWithHigherXp + 1;

  const totalUsers = await User.countDocuments({});

  return {
    rank,
    totalUsers
  };
}

async function getLeaderboard(options = {}) {
  const { league, page = 1, limit = 20 } = options;
  
  // Whitelist of allowed league tiers for filtering
  const ALLOWED_LEAGUES = ['All', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  
  const filter = {};
  if (league && league !== 'All') {
    // Validate league against whitelist
    if (!ALLOWED_LEAGUES.includes(league)) {
      throw new Error(`Invalid league tier. Allowed values: ${ALLOWED_LEAGUES.join(', ')}`);
    }
    // Support filtering by tier: "Bronze" matches "Bronze 1", "Bronze 2", "Bronze 3"
    // Use exact prefix matching with escaped regex
    filter.league = new RegExp(`^${league.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
  }

  const skip = (page - 1) * limit;
  const total = await User.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const users = await User.find(filter)
    .select('username totalXp level profilePic streakCount league')
    .sort({ totalXp: -1, streakCount: -1, username: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    users: users.map((user, index) => ({
      rank: skip + index + 1,
      userId: String(user._id),
      name: user.username,
      xp: user.totalXp || 0,
      level: user.level || 1,
      profilePic: user.profilePic || '',
      streakCount: user.streakCount || 0,
      league: user.league || 'Bronze 1'
    })),
    total,
    page,
    totalPages
  };
}

async function getCourseCatalog(req, res) {
  try {
    await ensureDefaultCourses();

    const courses = await Course.find({})
      .select('slug title description domain level totalLectures')
      .sort({ title: 1 });

    return res.status(200).json({ courses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function enrollInCourse(req, res) {
  try {
    await ensureDefaultCourses();

    const courseSlug = String(req.params.courseSlug || '').trim().toLowerCase();
    if (!courseSlug) {
      return res.status(400).json({ message: 'courseSlug is required.' });
    }

    const course = await Course.findOne({ slug: courseSlug });
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const existingProgress = await UserProgress.findOne({ user: req.user.id, course: course._id });
    if (existingProgress) {
      return res.status(200).json({
        message: 'Already enrolled in this course.',
        course: serializeCourse(existingProgress, course)
      });
    }

    const lectureProgress = Array.from({ length: course.totalLectures }, (_, idx) => ({
      lectureNumber: idx + 1,
      points: 0,
      completed: false,
      completedAt: null
    }));

    const created = await UserProgress.create({
      user: req.user.id,
      course: course._id,
      status: 'active',
      totalPoints: 0,
      lectureProgress
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        notifications: {
          title: 'Course enrolled',
          detail: `You enrolled in ${course.title}.`
        }
      }
    });

    const userStats = await recomputeAndPersistUserStats(req.user.id);

    return res.status(201).json({
      message: 'Enrolled successfully.',
      userStats,
      course: serializeCourse(created, course)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateCourseProgress(req, res) {
  try {
    const courseSlug = String(req.params.courseSlug || '').trim().toLowerCase();
    const lectureNumber = Number(req.body?.lectureNumber);
    const points = Number.isFinite(Number(req.body?.points)) ? Math.max(0, Math.floor(Number(req.body?.points))) : 25;
    const completed = req.body?.completed !== undefined ? Boolean(req.body.completed) : true;

    if (!courseSlug) {
      return res.status(400).json({ message: 'courseSlug is required.' });
    }

    if (!Number.isInteger(lectureNumber) || lectureNumber < 1) {
      return res.status(400).json({ message: 'lectureNumber must be a positive integer.' });
    }

    const course = await Course.findOne({ slug: courseSlug });
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (lectureNumber > course.totalLectures) {
      return res.status(400).json({ message: `lectureNumber exceeds course limit (${course.totalLectures}).` });
    }

    const progressDoc = await UserProgress.findOne({ user: req.user.id, course: course._id });
    if (!progressDoc) {
      return res.status(404).json({ message: 'You are not enrolled in this course.' });
    }

    const lecturesByNumber = new Map();
    for (const lecture of progressDoc.lectureProgress || []) {
      lecturesByNumber.set(lecture.lectureNumber, {
        lectureNumber: lecture.lectureNumber,
        points: lecture.points,
        completed: lecture.completed,
        completedAt: lecture.completedAt || null
      });
    }

    for (let i = 1; i <= course.totalLectures; i += 1) {
      if (!lecturesByNumber.has(i)) {
        lecturesByNumber.set(i, {
          lectureNumber: i,
          points: 0,
          completed: false,
          completedAt: null
        });
      }
    }

    const targetLecture = lecturesByNumber.get(lectureNumber);
    if (completed) {
      const wasAlreadyCompleted = targetLecture.completed;
      targetLecture.completed = true;
      // Only set completedAt on first completion transition, not on re-completions
      // This prevents replaying lectures from re-counting old XP in new challenge periods
      if (!wasAlreadyCompleted) {
        targetLecture.completedAt = new Date();
      }
      targetLecture.points = Math.max(targetLecture.points || 0, points);
    } else {
      targetLecture.completed = false;
      targetLecture.completedAt = null;
      targetLecture.points = 0;
    }

    const nextLectureProgress = Array.from(lecturesByNumber.values()).sort((a, b) => a.lectureNumber - b.lectureNumber);
    const completedLectures = nextLectureProgress.filter((lecture) => lecture.completed).length;
    const totalPoints = nextLectureProgress.reduce((sum, lecture) => sum + (lecture.points || 0), 0);

    let status = 'active';
    if (completedLectures === 0) {
      status = 'paused';
    } else if (completedLectures === course.totalLectures) {
      status = 'completed';
    }

    progressDoc.lectureProgress = nextLectureProgress;
    progressDoc.totalPoints = totalPoints;
    progressDoc.status = status;
    await progressDoc.save();

    const userStats = await recomputeAndPersistUserStats(req.user.id);

    // Auto-sync challenge progress after lesson completion
    try {
      await syncUserChallenges(req.user.id);
    } catch (challengeError) {
      // Don't fail the request if challenge sync fails
      console.error('Challenge sync error:', challengeError);
    }

    // Check and award badges based on new progress
    try {
      await checkAndAwardBadges(req.user.id);
    } catch (badgeError) {
      console.error('Badge check error:', badgeError);
    }

    return res.status(200).json({
      message: 'Progress updated.',
      userStats,
      course: serializeCourse(progressDoc, course)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getMyLearningOverview(req, res) {
  try {
    await ensureDefaultCourses();

    const progressDocs = await UserProgress.find({ user: req.user.id })
      .populate({
        path: 'course',
        select: 'slug title description domain level totalLectures'
      })
      .sort({ updatedAt: -1 });

    const courses = progressDocs
      .filter((progressDoc) => progressDoc.course)
      .map((progressDoc) => serializeCourse(progressDoc, progressDoc.course));

    const userStats = await recomputeAndPersistUserStats(req.user.id);
    const rankInfo = await getUserRank(req.user.id, userStats.totalXp);
    const leaderboardData = await getLeaderboard({ limit: 10 });

    const currentUser = await User.findById(req.user.id).select('username email profilePic streakCount league');

    return res.status(200).json({
      user: {
        id: String(currentUser._id),
        username: currentUser.username,
        email: currentUser.email,
        profilePic: currentUser.profilePic || '',
        streakCount: currentUser.streakCount || 0,
        league: currentUser.league || 'Bronze'
      },
      stats: {
        totalXp: userStats.totalXp,
        level: userStats.level,
        league: userStats.league,
        xpToNextLevel: userStats.xpToNextLevel,
        levelProgressPercent: userStats.levelProgressPercent,
        rank: rankInfo.rank,
        totalUsers: rankInfo.totalUsers
      },
      enrolledCourses: courses,
      leaderboard: leaderboardData.users
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getLeaderboardHandler(req, res) {
  try {
    const league = req.query.league || 'All';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const leaderboardData = await getLeaderboard({ league, page, limit });

    const currentUser = await User.findById(req.user.id).select('totalXp league');
    
    // Explicit null guard - return controlled error if user record is missing
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const rankInfo = await getUserRank(req.user.id, currentUser.totalXp || 0);

    return res.status(200).json({
      leaderboard: leaderboardData.users,
      currentUserRank: rankInfo.rank,
      currentUserLeague: currentUser.league || 'Bronze 1',
      total: leaderboardData.total,
      page: leaderboardData.page,
      totalPages: leaderboardData.totalPages
    });
  } catch (error) {
    // Return 400 for validation errors (invalid league), 500 for other errors
    const statusCode = error.message.includes('Invalid league') ? 400 : 500;
    return res.status(statusCode).json({ message: error.message });
  }
}

module.exports = {
  getCourseCatalog,
  enrollInCourse,
  updateCourseProgress,
  getMyLearningOverview,
  getLeaderboardHandler
};

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { Post } = require('../models/post.model'); // adjust path to match your actual Post model location

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI); // match your actual env var name
    console.log('Connected to MongoDB');

    const posts = await Post.find({ image: { $regex: /thumbnail\?id=|uc\?id=/ } });

    for (const post of posts) {
      if (post.driveFileId) {
        post.image = `/api/community/posts/image/${post.driveFileId}`;
        await post.save();
      }
    }

    console.log(`Updated ${posts.length} posts`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
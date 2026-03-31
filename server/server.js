// File used to start server

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const { startMonthlyRewardJob, startWeeklyChallengeReminder } = require('./src/jobs/scheduler');
const { reconcileUserLeagues } = require('./src/jobs/reconciliation');
const { ensureDefaultBadges } = require('./src/controllers/badge.controller');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();

    await ensureDefaultBadges();
    console.log('✅ Default badges ensured');

    await reconcileUserLeagues();

    startMonthlyRewardJob();
    startWeeklyChallengeReminder();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
})();
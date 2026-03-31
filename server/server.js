// File used to start server

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const { startMonthlyRewardJob, startWeeklyChallengeReminder } = require('./src/jobs/scheduler');

connectDB();

// Start scheduled jobs
startMonthlyRewardJob();
startWeeklyChallengeReminder();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// File used to start server

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const { startMonthlyRewardJob, startWeeklyChallengeReminder } = require('./src/jobs/scheduler');
const { reconcileUserLeagues } = require('./src/jobs/reconciliation');

connectDB();

// Run one-time reconciliation to sync league values for existing users
reconcileUserLeagues().catch(err => {
  console.error('Failed to reconcile user leagues:', err);
});

// Start scheduled jobs
startMonthlyRewardJob();
startWeeklyChallengeReminder();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
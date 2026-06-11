require('dotenv').config();
const http = require('http');
const WebSocket = require('ws');
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

    // Create HTTP server from Express app
    const server = http.createServer(app);

    // Attach WebSocket server
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
      console.log('🔌 New WebSocket connection');

      ws.on('message', (message) => {
        console.log('📩 Received:', message);

        // Broadcast to all connected clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });

      ws.send('👋 Welcome to the community WebSocket!');
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
})();
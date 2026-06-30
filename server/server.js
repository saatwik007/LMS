require('dotenv').config();
const app = require('./src/app');
const mongoose = require('mongoose');
const connectDB = require('./src/db/db');
const { startMonthlyRewardJob, startWeeklyChallengeReminder } = require('./src/jobs/scheduler');
const { reconcileUserLeagues } = require('./src/jobs/reconciliation');
const { ensureDefaultBadges } = require('./src/controllers/badge.controller');
const Message = require('./src/models/messages.model');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 5000;

const clients = new Map();

(async () => {
  try {
    await connectDB();
    await ensureDefaultBadges();
    console.log('✅ Default badges ensured');

    await reconcileUserLeagues();
    startMonthlyRewardJob();
    startWeeklyChallengeReminder();

    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    // const history = await Message.find().sort({ timestamp: -1 }).limit(5);

    wss.on('connection', async (socket) => {
      console.log('New WS connection')

      //send last 20 msgs as history
      // const history = await Message.find().sort({ timestamp: -1 }).limit(20).lean();
      // socket.send(JSON.stringify({ type: 'history', messages: history.reverse() }))

      let registeredUserId = null;


      socket.on('message', async (rawData) => {
        try {
          const msg = JSON.parse(rawData);

          if (msg.type === 'register') {
            registeredUserId = msg.userId;
            clients.set(msg.userId, socket);
            console.log(`✅ Registered user ${msg.userId}`);
            console.log(`📋 Active clients:`, Array.from(clients.keys()));
            return;
          }
          console.log('📨 Raw incoming message:', JSON.stringify(msg, null, 2));  // ✅ ADD THIS

          // Handle registration
          // if (msg.type === 'register') {
          //   clients.set(msg.userId, socket);
          //   console.log(`registered user ${msg.userId}`)
          //   console.log(`📋 Total active clients:`, clients.size);  // ✅ ADD THIS
          //   return;
          // }

          // Handle chat messages
          if (msg.type === 'chat-message') {
            console.log('💬 Message type detected');
            console.log('msg.message:', msg.message);  // ✅ ADD THIS
            const { senderId, recipientId, text, time, id } = msg.message
            console.log('Destructured:', { senderId, recipientId, text, time, id });  // ✅ ADD THIS

            if (!senderId || !recipientId || !text) {
              console.error('❌ Missing required fields:', { senderId, recipientId, text });
              return;  // ✅ ADD THIS - Don't try to save incomplete data
            }


            // Save to DB
            const saved = await Message.create({
              senderId: new mongoose.Types.ObjectId(senderId),
              recipientId: new mongoose.Types.ObjectId(recipientId),
              content: text,
              type: 'chat_message',
              timestamp: new Date(),
              delivered: false
            });
            console.log('💾 Saved message:', saved.senderId, typeof saved.senderId);

            // Build Payload
            const payload = JSON.stringify({
              type: 'chat-message',
              message: {
                id,
                senderId,
                recipientId,
                text,
                time
              }
            });

            // Send to recipient
            const recipientSocket = clients.get(recipientId);
            console.log('🔍 Looking for recipient:', recipientId);
            console.log('📋 Active clients:', Array.from(clients.keys()));  // ✅ ADD THIS
            console.log('🎯 Recipient socket found:', !!recipientSocket);

            if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
              recipientSocket.send(payload);
              console.log('✅ Message sent to recipient:', recipientId);
            } else {
              console.log('❌ Recipient not connected:', recipientId);  // ✅ ADD THIS
            }

            //Echo back to sender (confirmation)
            // if (socket.readyState === WebSocket.OPEN) {
            //   socket.send(payload);
            // }
          };
        } catch (err) {
          console.error('Faile to proccess msg', err)
        }
      });
      socket.on('close', () => {
        if (registeredUserId) {
          clients.delete(registeredUserId);
          console.log(`🔴 User ${registeredUserId} disconnected and removed`);
          console.log(`📋 Remaining clients:`, Array.from(clients.keys()));
        }
      })
    });
    const sample = await Message.findOne({}).lean();
    server.listen(PORT, () => {
      console.log(`🚀 Server running with WebSockets + MongoDB on port ${PORT}`);
      console.log('Sample message from DB:', sample);
      console.log('senderId type:', typeof sample?.senderId, sample?.senderId);
    })
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
    console.error('❌ Error:', err.message); // ← will now show the real error
    console.error(err.stack);
  }
})();
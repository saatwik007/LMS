const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const User = require("../models/user.model");

function getFirebaseCredential() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) return applicationDefault();

  const serviceAccount = JSON.parse(serviceAccountJson);
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }
  return cert(serviceAccount);
}

const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp({
    credential: getFirebaseCredential(),
  });
const messaging = getMessaging(firebaseApp);

async function sendPushNotification(deviceToken, title, body, data = {}) {
  try {
    return await messaging.send({
      token: deviceToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ),
    });
  } catch (error) {
    console.error("FCM send failed:", error);
    throw error;
  }
}

async function notifyUser(userId, title, body, data = {}) {
  const user = await User.findById(userId).select("deviceTokens");

  if (!user?.deviceTokens?.length) return;

  await Promise.allSettled(
    user.deviceTokens.map((token) =>
      sendPushNotification(token, title, body, data)
    )
  );
}

module.exports = {
  sendPushNotification,
  notifyUser,
};
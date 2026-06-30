const nodemailer = require('nodemailer');

let cachedTransporter = null;

/**
 * Returns true when SMTP credentials are configured via environment variables.
 */
function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/**
 * Lazily builds and caches a nodemailer transporter from environment variables.
 * Returns null when SMTP is not configured.
 */
function getTransporter() {
  if (!isMailConfigured()) return null;
  if (cachedTransporter) return cachedTransporter;

  const port = Number(process.env.SMTP_PORT) || 587;
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // true for 465, false for 587/STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return cachedTransporter;
}

/**
 * Sends a password-reset OTP email.
 * Resolves to { sent: true } on success, or { sent: false } when SMTP is not
 * configured (so callers can fall back to dev behavior). Throws on send errors.
 */
async function sendOtpEmail(to, otp) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false };

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f1419;border-radius:16px;color:#e5e7eb">
      <h2 style="margin:0 0 8px;color:#22d3ee">Codify password reset</h2>
      <p style="margin:0 0 18px;color:#9ca3af;font-size:14px">Use the one-time code below to reset your password. It expires in 10 minutes.</p>
      <div style="font-size:32px;font-weight:800;letter-spacing:10px;text-align:center;padding:16px;background:#1a2332;border:1px solid #2a3a4a;border-radius:12px;color:#fff">${otp}</div>
      <p style="margin:18px 0 0;color:#6b7280;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
    </div>`;

  await transporter.sendMail({
    from: `"Codify" <${from}>`,
    to,
    subject: 'Your Codify password reset code',
    text: `Your Codify password reset code is ${otp}. It expires in 10 minutes.`,
    html
  });

  return { sent: true };
}

module.exports = { sendOtpEmail, isMailConfigured };

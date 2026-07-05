const crypto = require('crypto');

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

function hashOtp(email, otp) {
  const pepper = process.env.OTP_PEPPER || 'change-me';
  return crypto
    .createHash('sha256')
    .update(`${email.toLowerCase().trim()}.${otp}.${pepper}`)
    .digest('hex');
}

module.exports = { generateOtp, hashOtp };
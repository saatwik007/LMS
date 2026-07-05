const mongoose =  require('mongoose');

const OTPSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 } 
}, { timestamps: true });

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-delete
module.exports = mongoose.model('otpCode', OTPSchema);
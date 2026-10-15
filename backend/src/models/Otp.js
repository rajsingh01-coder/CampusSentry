const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  isUsed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);

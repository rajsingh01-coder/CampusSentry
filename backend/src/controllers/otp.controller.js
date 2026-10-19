const Otp = require('../models/Otp');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) throw new ApiError(400, 'Phone number is required');

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ phone, otpHash: generatedOtp, expiresAt });

    console.log(`[SMS Simulation] OTP for ${phone} is: ${generatedOtp}`);

    res.status(200).json(new ApiResponse(200, { phone, simulatedOtp: generatedOtp }, 'OTP sent successfully'));
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const record = await Otp.findOne({ phone, isUsed: false }).sort({ createdAt: -1 });

    if (!record) throw new ApiError(400, 'No active OTP request found');
    if (new Date() > record.expiresAt) throw new ApiError(400, 'OTP expired');
    if (record.otpHash !== otp) {
      record.attempts += 1;
      await record.save();
      throw new ApiError(400, 'Invalid OTP');
    }

    record.isUsed = true;
    await record.save();

    res.status(200).json(new ApiResponse(200, { verified: true }, 'OTP verified successfully'));
  } catch (err) {
    next(err);
  }
};

module.exports = { sendOtp, verifyOtp };

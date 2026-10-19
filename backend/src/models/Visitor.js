const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  purpose: { type: String, required: true },
  personToMeet: { type: String, required: true },
  department: { type: String, required: true },
  otpVerified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Pending Verification', 'Pending Approval', 'Approved', 'Rejected', 'Cancelled', 'Expired'],
    default: 'Pending Verification'
  },
  rejectionReason: { type: String, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);

const mongoose = require('mongoose');

const entryLogSchema = new mongoose.Schema({
  visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date, default: null },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['IN', 'OUT'], default: 'IN' }
}, { timestamps: true });

module.exports = mongoose.model('EntryLog', entryLogSchema);

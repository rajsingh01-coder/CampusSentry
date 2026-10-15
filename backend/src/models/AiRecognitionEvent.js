const mongoose = require('mongoose');

const aiRecognitionEventSchema = new mongoose.Schema({
  externalEventId: { type: String, trim: true },
  matchScore: { type: Number, required: true },
  candidateVisitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', default: null },
  status: {
    type: String,
    enum: ['MATCHED', 'UNCERTAIN', 'FAILED'],
    default: 'UNCERTAIN'
  },
  metadata: { type: mongoose.Schema.Types.Mixed },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('AiRecognitionEvent', aiRecognitionEventSchema);

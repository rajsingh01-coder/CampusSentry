const AiRecognitionEvent = require('../models/AiRecognitionEvent');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const recordAiEvent = async (req, res, next) => {
  try {
    const { externalEventId, matchScore, candidateVisitorId, metadata } = req.body;

    let status = 'UNCERTAIN';
    if (matchScore >= 0.85) status = 'MATCHED';
    else if (matchScore < 0.50) status = 'FAILED';

    const event = await AiRecognitionEvent.create({
      externalEventId,
      matchScore,
      candidateVisitorId: candidateVisitorId || null,
      status,
      metadata
    });

    res.status(201).json(new ApiResponse(201, event, 'AI recognition event logged'));
  } catch (err) {
    next(err);
  }
};

const getAiEvents = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const events = await AiRecognitionEvent.find(filter)
      .populate('candidateVisitorId', 'name phone department')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, events, 'AI events retrieved'));
  } catch (err) {
    next(err);
  }
};

module.exports = { recordAiEvent, getAiEvents };

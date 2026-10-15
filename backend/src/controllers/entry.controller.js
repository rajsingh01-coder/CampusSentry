const EntryLog = require('../models/EntryLog');
const Visitor = require('../models/Visitor');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const checkInVisitor = async (req, res, next) => {
  try {
    const { visitorId } = req.body;
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) throw new ApiError(404, 'Visitor not found');
    if (visitor.status !== 'Approved') {
      throw new ApiError(400, `Cannot check in visitor with status: ${visitor.status}`);
    }

    const activeEntry = await EntryLog.findOne({ visitorId, status: 'IN' });
    if (activeEntry) throw new ApiError(400, 'Visitor is already checked in');

    const entry = await EntryLog.create({
      visitorId,
      checkedInBy: req.user.id,
      status: 'IN',
      checkInTime: new Date()
    });

    res.status(201).json(new ApiResponse(201, entry, 'Visitor checked in successfully'));
  } catch (err) {
    next(err);
  }
};

const checkOutVisitor = async (req, res, next) => {
  try {
    const { visitorId } = req.body;
    const activeEntry = await EntryLog.findOne({ visitorId, status: 'IN' });
    if (!activeEntry) throw new ApiError(404, 'No active check-in record found for this visitor');

    activeEntry.status = 'OUT';
    activeEntry.checkOutTime = new Date();
    activeEntry.checkedOutBy = req.user.id;
    await activeEntry.save();

    res.status(200).json(new ApiResponse(200, activeEntry, 'Visitor checked out successfully'));
  } catch (err) {
    next(err);
  }
};

const getEntryLogs = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const logs = await EntryLog.find(filter)
      .populate('visitorId', 'name phone purpose personToMeet department')
      .populate('checkedInBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, logs, 'Entry logs retrieved'));
  } catch (err) {
    next(err);
  }
};

module.exports = { checkInVisitor, checkOutVisitor, getEntryLogs };

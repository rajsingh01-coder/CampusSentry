const Visitor = require('../models/Visitor');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const getPendingApprovals = async (req, res, next) => {
  try {
    const pending = await Visitor.find({ status: 'Pending Approval' }).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, pending, 'Pending visitors retrieved'));
  } catch (err) {
    next(err);
  }
};

const approveVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );
    if (!visitor) throw new ApiError(404, 'Visitor record not found');
    res.status(200).json(new ApiResponse(200, visitor, 'Visitor approved'));
  } catch (err) {
    next(err);
  }
};

const rejectVisitor = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected', rejectionReason: reason || 'Not specified' },
      { new: true }
    );
    if (!visitor) throw new ApiError(404, 'Visitor record not found');
    res.status(200).json(new ApiResponse(200, visitor, 'Visitor rejected'));
  } catch (err) {
    next(err);
  }
};

module.exports = { getPendingApprovals, approveVisitor, rejectVisitor };

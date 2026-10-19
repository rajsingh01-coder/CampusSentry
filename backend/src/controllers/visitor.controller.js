const Visitor = require('../models/Visitor');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const registerVisitor = async (req, res, next) => {
  try {
    const visitorData = { ...req.body, createdBy: req.user?.id };
    const visitor = await Visitor.create(visitorData);
    res.status(201).json(new ApiResponse(201, visitor, 'Visitor registered successfully'));
  } catch (err) {
    next(err);
  }
};

const getVisitors = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search,$options: 'i' };

    const visitors = await Visitor.find(query).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, visitors, 'Visitors fetched'));
  } catch (err) {
    next(err);
  }
};

const getVisitorById = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) throw new ApiError(404, 'Visitor not found');
    res.status(200).json(new ApiResponse(200, visitor, 'Visitor retrieved'));
  } catch (err) {
    next(err);
  }
};

module.exports = { registerVisitor, getVisitors, getVisitorById };

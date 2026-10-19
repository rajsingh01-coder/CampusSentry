const Visitor = require('../models/Visitor');
const EntryLog = require('../models/EntryLog');
const ApiResponse = require('../utils/ApiResponse');

const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalVisitorsToday, activeOnCampus, pendingApprovals] = await Promise.all([
      Visitor.countDocuments({ createdAt: { $gte: today } }),
      EntryLog.countDocuments({ status: 'IN' }),
      Visitor.countDocuments({ status: 'Pending Approval' })
    ]);

    const stats = {
      totalVisitorsToday,
      activeOnCampus,
      pendingApprovals
    };

    res.status(200).json(new ApiResponse(200, stats, 'Dashboard statistics fetched'));
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };

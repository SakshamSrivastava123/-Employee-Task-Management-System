const asyncHandler = require('../utils/asyncHandler');
const { getDashboard } = require('../services/dashboardService');

exports.get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getDashboard() });
});

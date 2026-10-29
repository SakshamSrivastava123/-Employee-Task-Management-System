const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');

router.use('/employees', require('./employeeRoutes'));
router.use('/tasks', require('./taskRoutes'));
router.get('/dashboard', dashboardController.get);

module.exports = router;

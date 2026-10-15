const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/admin.controller');
const verifyJWT = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

router.get('/dashboard', verifyJWT, authorizeRoles('admin'), getDashboardStats);

module.exports = router;

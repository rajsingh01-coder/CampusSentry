const express = require('express');
const router = express.Router();
const { getPendingApprovals, approveVisitor, rejectVisitor } = require('../controllers/approval.controller');
const verifyJWT = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

router.get('/pending', verifyJWT, authorizeRoles('admin'), getPendingApprovals);
router.patch('/:id/approve', verifyJWT, authorizeRoles('admin'), approveVisitor);
router.patch('/:id/reject', verifyJWT, authorizeRoles('admin'), rejectVisitor);

module.exports = router;

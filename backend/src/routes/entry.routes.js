const express = require('express');
const router = express.Router();
const { checkInVisitor, checkOutVisitor, getEntryLogs } = require('../controllers/entry.controller');
const verifyJWT = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

router.post('/check-in', verifyJWT, authorizeRoles('admin', 'security'), checkInVisitor);
router.post('/check-out', verifyJWT, authorizeRoles('admin', 'security'), checkOutVisitor);
router.get('/', verifyJWT, authorizeRoles('admin', 'security', 'staff'), getEntryLogs);

module.exports = router;

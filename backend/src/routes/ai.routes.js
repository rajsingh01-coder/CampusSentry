const express = require('express');
const router = express.Router();
const { recordAiEvent, getAiEvents } = require('../controllers/ai.controller');
const verifyJWT = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

router.post('/recognition-events', recordAiEvent);
router.get('/recognition-events', verifyJWT, authorizeRoles('admin', 'security'), getAiEvents);

module.exports = router;

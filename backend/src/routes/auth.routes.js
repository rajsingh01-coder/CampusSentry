const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/auth.controller');
const verifyJWT = require('../middlewares/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', verifyJWT, getMe);

module.exports = router;

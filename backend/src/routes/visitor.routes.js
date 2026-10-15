const express = require('express');
const router = express.Router();
const { registerVisitor, getVisitors, getVisitorById } = require('../controllers/visitor.controller');
const verifyJWT = require('../middlewares/auth.middleware');

router.post('/', verifyJWT, registerVisitor);
router.get('/', verifyJWT, getVisitors);
router.get('/:id', verifyJWT, getVisitorById);

module.exports = router;

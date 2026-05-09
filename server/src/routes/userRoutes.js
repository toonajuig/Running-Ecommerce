const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', requireAuth, userController.me);
router.get('/', requireAuth, requireRole('admin'), userController.list);

module.exports = router;

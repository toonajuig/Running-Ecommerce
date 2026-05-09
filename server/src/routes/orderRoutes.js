const express = require('express');
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);
router.get('/', orderController.listMine);
router.get('/:id', orderController.get);
router.post('/', orderController.create);

module.exports = router;

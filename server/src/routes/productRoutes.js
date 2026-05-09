const express = require('express');
const productController = require('../controllers/productController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', productController.list);
router.get('/:id', productController.get);
router.post('/', requireAuth, requireRole('admin'), productController.create);
router.put('/:id', requireAuth, requireRole('admin'), productController.update);
router.delete('/:id', requireAuth, requireRole('admin'), productController.remove);

module.exports = router;

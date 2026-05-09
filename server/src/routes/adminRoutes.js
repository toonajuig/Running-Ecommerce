const express = require('express');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const Order   = require('../models/orderModel');
const Product = require('../models/productModel');

const router = express.Router();

// ทุก route ใน /api/admin ต้อง login + เป็น admin
router.use(requireAuth, requireRole('admin'));

const VALID_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

// ── Orders ────────────────────────────────────────────────────────────────────

router.get('/orders', async (req, res, next) => {
  try {
    res.json(await Order.listAll());
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status: ${status}` });
    }
    const order = await Order.updateStatusAdmin(req.params.id, status);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// ── Product variants ───────────────────────────────────────────────────────────

router.post('/products/:id/variants', async (req, res, next) => {
  try {
    const { size, sku, stock, priceOverride } = req.body;
    if (!size || !sku || stock == null) {
      return res.status(400).json({ error: 'size, sku, and stock are required' });
    }
    const variant = await Product.addVariant(req.params.id, { size, sku, stock, priceOverride });
    res.status(201).json(variant);
  } catch (err) {
    next(err);
  }
});

router.patch('/products/:productId/variants/:id', async (req, res, next) => {
  try {
    const { stock, priceOverride } = req.body;
    const variant = await Product.updateVariant(req.params.id, { stock, priceOverride });
    if (!variant) return res.status(404).json({ error: 'Variant not found' });
    res.json(variant);
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:productId/variants/:id', async (req, res, next) => {
  try {
    const deleted = await Product.deleteVariant(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Variant not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const Order = require('../models/orderModel');

const create = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array' });
    }
    const order = await Order.createWithItems({ userId: req.user.id, items });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

const listMine = async (req, res, next) => {
  try {
    res.json(await Order.listForUser(req.user.id));
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const order = await Order.findByIdForUser(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

const VALID_TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid:    ['shipped', 'cancelled'],
  shipped: ['delivered'],
};

const patchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const current = await Order.findByIdForUser(req.params.id, req.user.id);
    if (!current) return res.status(404).json({ error: 'Order not found' });

    const allowed = VALID_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from '${current.status}' to '${status}'`,
      });
    }

    const updated = await Order.updateStatus(req.params.id, req.user.id, status);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, listMine, get, patchStatus };

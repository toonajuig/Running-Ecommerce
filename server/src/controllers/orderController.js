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

module.exports = { create, listMine, get };

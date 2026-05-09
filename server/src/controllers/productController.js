const Product = require('../models/productModel');

const list = async (req, res, next) => {
  try {
    res.json(await Product.list());
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const {
      categoryId, brandId,
      name, description, price, imageUrl,
      gender, shoeType, weightGrams, dropMm,
    } = req.body;

    if (!name || price == null || !categoryId) {
      return res.status(400).json({ error: 'name, price, and categoryId are required' });
    }

    const product = await Product.create({
      categoryId, brandId,
      name, description, price, imageUrl,
      gender, shoeType, weightGrams, dropMm,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const {
      categoryId, brandId,
      name, description, price, imageUrl,
      gender, shoeType, weightGrams, dropMm,
    } = req.body;

    const product = await Product.update(req.params.id, {
      categoryId, brandId,
      name, description, price, imageUrl,
      gender, shoeType, weightGrams, dropMm,
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const deleted = await Product.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { list, get, create, update, remove };

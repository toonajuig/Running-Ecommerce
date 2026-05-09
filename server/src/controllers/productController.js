const Product = require('../models/productModel');

const list = async (req, res, next) => {
  try {
    const { category, brand, gender, sort, q, page, limit } = req.query;
    const minPrice = req.query.minPrice != null ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice != null ? Number(req.query.maxPrice) : undefined;
    res.json(await Product.list({
      category, brand, gender, minPrice, maxPrice, sort, q,
      page:  page  ? Number(page)  : 1,
      limit: limit ? Number(limit) : 12,
    }));
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

const listVariants = async (req, res, next) => {
  try {
    const ids = String(req.query.ids || '')
      .split(',')
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0);
    if (ids.length === 0) return res.json([]);
    res.json(await Product.findVariantsByIds(ids));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, get, create, update, remove, listVariants };

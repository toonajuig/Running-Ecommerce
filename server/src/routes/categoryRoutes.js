const express = require('express');
const Category = require('../models/categoryModel');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await Category.list());
  } catch (err) {
    next(err);
  }
});

module.exports = router;

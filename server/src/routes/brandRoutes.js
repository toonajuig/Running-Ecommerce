const express = require('express');
const Brand = require('../models/brandModel');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await Brand.list());
  } catch (err) {
    next(err);
  }
});

module.exports = router;

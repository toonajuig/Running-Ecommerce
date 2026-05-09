require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const userRoutes    = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes    = require('./routes/brandRoutes');
const adminRoutes    = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/users',     userRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands',     brandRoutes);
app.use('/api/admin',      adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

module.exports = app;

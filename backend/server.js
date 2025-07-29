const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(express.json());

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'technova_db';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: false
});

// Models
const User = sequelize.define('User', {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  password_hash: DataTypes.STRING
}, { timestamps: true });

const Product = sequelize.define('Product', {
  product_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  price: DataTypes.DECIMAL,
  image_url: DataTypes.STRING,
  stock_quantity: DataTypes.INTEGER,
  category: DataTypes.STRING,
  created_at: DataTypes.DATE
}, {
  tableName: 'Products',
  timestamps: false
});

const Order = sequelize.define('Order', {
  order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: DataTypes.INTEGER,
  order_date: DataTypes.DATE,
  status: DataTypes.STRING,
  total_amount: DataTypes.DECIMAL,
  shipping_address: DataTypes.TEXT
}, {
  tableName: 'Orders',
  timestamps: false
});

const OrderItem = sequelize.define('OrderItem', {
  order_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: DataTypes.INTEGER,
  product_id: DataTypes.INTEGER,
  quantity: DataTypes.INTEGER,
  unit_price: DataTypes.DECIMAL
}, {
  tableName: 'OrderItems',
  timestamps: false
});

const Review = sequelize.define('Review', {
  review_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: DataTypes.INTEGER,
  product_id: DataTypes.INTEGER,
  rating: DataTypes.INTEGER,
  comment: DataTypes.TEXT,
  created_at: DataTypes.DATE
}, {
  tableName: 'Reviews',
  timestamps: false
});

// Set up association for username in reviews
Review.belongsTo(User, { foreignKey: 'user_id' });

// DB Connection Test
sequelize.authenticate()
  .then(() => console.log('✅ Connected to MySQL'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Register
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const password_hash = await bcrypt.hash(password, 10);
  await User.create({ username, email, password_hash });
  res.json({ message: 'User registered!' });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ message: 'Login successful', username: user.username, userId: user.id, email: user.email });
});

// Products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Place Order
app.post('/place-order', async (req, res) => {
  try {
    const { userId, items } = req.body;
    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Missing user or items' });
    }
    const productIds = items.map(it => it.product_id);
    const dbProducts = await Product.findAll({ where: { product_id: productIds } });

    // Verify stock
    for (let item of items) {
      const prod = dbProducts.find(p => p.product_id === item.product_id);
      if (!prod) return res.status(400).json({ message: `Product not found: ${item.product_id}` });
      if (prod.stock_quantity < item.quantity)
        return res.status(400).json({ message: `Not enough stock for ${prod.name}` });
    }

    // Calculate total
    let total = items.reduce((sum, it) => {
      const prod = dbProducts.find(p => p.product_id === it.product_id);
      return sum + parseFloat(prod.price) * it.quantity;
    }, 0);

    const order = await Order.create({
      user_id: userId,
      order_date: new Date(),
      status: 'Placed',
      total_amount: total,
      shipping_address: ''
    });

    for (let item of items) {
      const prod = dbProducts.find(p => p.product_id === item.product_id);
      await OrderItem.create({
        order_id: order.order_id,
        product_id: prod.product_id,
        quantity: item.quantity,
        unit_price: prod.price
      });
      await prod.update({ stock_quantity: prod.stock_quantity - item.quantity });
    }
    res.json({ message: 'Order placed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Order failed', error: err.message });
  }
});

// Get order history for a user
app.get('/orders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.findAll({ where: { user_id: userId }, order: [['order_date', 'DESC']] });

    // For each order, get its items and product names
    const result = [];
    for (let order of orders) {
      const items = await OrderItem.findAll({ where: { order_id: order.order_id } });
      // Add product info to each item
      const itemsWithProduct = [];
      for (let item of items) {
        const prod = await Product.findOne({ where: { product_id: item.product_id } });
        itemsWithProduct.push({
          ...item.toJSON(),
          product_name: prod ? prod.name : '',
          product_image: prod ? prod.image_url : '',
        });
      }
      result.push({
        ...order.toJSON(),
        items: itemsWithProduct
      });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get product reviews with reviewer name
app.get('/reviews/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    // Join with User to get username
    const reviews = await Review.findAll({
      where: { product_id: productId },
      include: [{ model: User, attributes: ['username'] }]
    });
    // Format reviews with username
    const result = reviews.map(r => ({
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      username: r.User ? r.User.username : 'Anonymous'
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

Review.belongsTo(User, { foreignKey: 'user_id' });

// Add review
app.post('/reviews', async (req, res) => {
  try {
    const { user_id, product_id, rating, comment } = req.body;
    if (!user_id || !product_id || !rating) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    await Review.create({ user_id, product_id, rating, comment });
    res.json({ message: 'Review submitted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add review' });
  }
});

// Health check
app.get('/', (req, res) => res.send('Backend API is running!'));

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
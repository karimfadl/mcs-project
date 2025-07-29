const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(express.json());

// ENV variables from docker-compose
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'technova_db';

// Sequelize init
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: false
});

// Define Models
const User = sequelize.define('User', {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  password_hash: DataTypes.STRING
});

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  price: DataTypes.DECIMAL,
  image_url: DataTypes.STRING,
  stock_quantity: DataTypes.INTEGER,
  category: DataTypes.STRING
}, {
  tableName: 'Products',
  timestamps: false
});

// Test DB connection
sequelize.authenticate()
  .then(() => console.log('✅ Connected to MySQL'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Register route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  await User.create({ username, email, password_hash });
  res.json({ message: 'User registered!' });
});

// Products route
app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Backend API is running!');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const chatRoutes = require('./routes/chatRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const path = require('path');
const app = express();

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// CORS first (before Helmet) so preflight OPTIONS get correct headers.
// Include both localhost and 127.0.0.1 so it works regardless of how the frontend is opened.
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:8080',
].filter(Boolean);
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));

// Security Middleware (after CORS). Allow cross-origin so API works from frontend.
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);

const sequelize = require('./config/database');

app.get('/api/v1/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ status: 'OK', database: 'Connected' });
    } catch (err) {
        res.status(503).json({ status: 'Error', database: 'Disconnected', error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('LumBarong API is running...');
});

module.exports = app;

const app = require('./src/app');
const sequelize = require('./src/config/database');
const http = require('http');
const { Server } = require('socket.io');

// Import ALL models so Sequelize knows about them before sync
require('./src/models/User');
require('./src/models/Product');
require('./src/models/Order');
require('./src/models/Message');
require('./src/models/Notification');
require('./src/models/Wishlist');

const server = http.createServer(app);
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:8080',
].filter(Boolean);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins.length ? allowedOrigins : true,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Make io accessible in controllers
app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_product', (productId) => {
        socket.join(`product_${productId}`);
        console.log(`Socket ${socket.id} joined product_${productId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL via Sequelize');

        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');
    } catch (err) {
        console.error('❌ Database connection/sync error:', err);
        console.log('⚠️ Server will continue to run, but DB-dependent features will fail.');
    }

    server.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📡 API Health Check: http://localhost:${PORT}/api/v1/health`);
    });
};

startServer();

require('dotenv').config();
const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import Database Connection
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const animalRoutes = require('./routes/animalRoutes');
const milkRoutes = require('./routes/milkRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const saleRoutes = require('./routes/saleRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const inventoryTransactionRoutes = require('./routes/inventoryTransactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const chartRoutes = require('./routes/chartRoutes');
const customerRoutes = require('./routes/customerRoutes'); // ✨ ADDED CUSTOMER ROUTES
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const User = require('./models/User');
const { setNotificationSocket } = require('./services/notificationService');

// Initialize Express App
const app = express();
const httpServer = http.createServer(app);

// Connect to MongoDB
connectDB();

// ==========================================
// 1. SECURITY & STANDARD MIDDLEWARE
// ==========================================

// Set security HTTP headers
app.use(helmet());

// CLIENT_URL accepts one or more comma-separated frontend URLs.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('This origin is not allowed by CORS'));
    },
    credentials: true
}));

// Body parser (Read JSON data from requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiting (Prevent DDoS & Brute Force)
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200, // Limit each IP to 200 requests per 10 mins
    message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api', limiter);

// Strict Rate Limiting for Login
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts
    message: 'Too many login attempts, please try again after 15 minutes'
});
app.use('/api/auth/login', authLimiter);

// Development Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ==========================================
// 2. API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: "Kurra's Dairy API is running securely." });
});

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/animals', animalRoutes);
app.use('/api/milk-production', milkRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/milk-sales', saleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inventory-transactions', inventoryTransactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/charts', chartRoutes);
app.use('/api/customers', customerRoutes); // ✨ ADDED TO MOUNT ROUTERS
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/notifications', notificationRoutes);


// ==========================================
// 3. ERROR HANDLING
// ==========================================

// Handle unhandled routes (404)
app.use((req, res, next) => {
    res.status(404).json({ 
        success: false, 
        message: `API Route Not Found: ${req.originalUrl}` 
    });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`[Error]: ${err.message}`);
    
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        err.message = 'Resource not found or invalid ID format';
        res.statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        err.message = 'Duplicate field value entered';
        res.statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        err.message = Object.values(err.errors).map(val => val.message).join(', ');
        res.statusCode = 400;
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error',
        // Only show stack trace in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});


// ==========================================
// 4. SERVER INITIALIZATION
// ==========================================

const PORT = process.env.PORT || 5000;

const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
    transports: ['websocket', 'polling']
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication required'));
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('_id role status');
        if (!user || user.status !== 'ACTIVE') return next(new Error('Authentication required'));
        socket.user = user;
        next();
    } catch (error) { next(new Error('Authentication required')); }
});

io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);
    socket.join(`role:${socket.user.role}`);
});
setNotificationSocket(io);

const server = httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections safely
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

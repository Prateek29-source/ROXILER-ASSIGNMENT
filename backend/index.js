require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./src/config/db.js');

const requestLogger = require('./src/middlewares/requestLogger');
const errorHandler = require('./src/middlewares/errorHandler');
const { apiLimiter } = require('./src/middlewares/rateLimiter');

// Import Routes
const authRoutes = require('./src/routes/authRoutes.js');
const userRoutes = require('./src/routes/userRoutes.js');
const storeRoutes = require('./src/routes/storeRoutes.js');

const createDefaultAdmin = require('./src/utils/setup.js');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
app.use('/api/', apiLimiter);

// Middleware to parse JSON request bodies with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to enable Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Request logging middleware
app.use(requestLogger);

// Run the setup script
createDefaultAdmin();

//Testing the basic route:
app.get('/', (req, res) =>{
    res.json({message: "Welcome to the Store Rating API!"});
});
// --- API Routes ---
app.get('/api', (req, res) => {
    res.json({ message: "Welcome to the Store Rating API!" });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);

// --- Global Error Handler ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

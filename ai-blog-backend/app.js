const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV !== 'development') {
            return callback(new Error('CORS Policy Error'), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Basic health check
app.get('/', (req, res) => res.send('AI Blog Writer API is Running'));

// Debug endpoint to view DB tables and sample data
app.get('/api/debug/db', (req, res) => {
    try {
        const db = require('./database/db');
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
        const data = {};
        for (const table of tables) {
            data[table.name] = db.prepare(`SELECT * FROM ${table.name} LIMIT 5`).all();
        }
        res.json({ 
            success: true, 
            tables: tables.map(t => t.name), 
            data 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Routes (to be implemented)
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/auth', require('./routes/auth'));

// Protected Routes
const auth = require('./middleware/auth');
app.use('/api/admin', auth, require('./routes/admin'));
app.use('/api/jobs', auth, require('./routes/jobs'));
app.use('/api/settings', auth, require('./routes/settings'));

app.use(require('./middleware/errorHandler'));

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
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

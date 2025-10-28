const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Database setup
const dbPath = process.env.DB_PATH || path.join(__dirname, 'activations.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
});

// Create tables
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS activations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            email TEXT,
            activated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS usage_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL,
            action TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    console.log('✅ Database tables initialized');
});

// Middleware
app.use(express.json({ limit: '10kb' }));

// CORS configuration
const allowedOrigins = [
    'https://cupidbot.org',
    'https://cupid-otys.vercel.app',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) {
            return callback(null, true);
        }
        
        // Allow Chrome extension origins (chrome-extension://...)
        if (origin.startsWith('chrome-extension://')) {
            return callback(null, true);
        }
        
        // Allow whitelisted origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Reject all others
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour per IP
    message: { error: 'Too many requests, please try again later' }
});

app.use('/api/', limiter);

// Generate activation key
function generateKey() {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
}

// Calculate expiry date (30 days from now)
function getExpiryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString();
}

// API Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Generate new activation key
app.post('/api/generate', (req, res) => {
    const { email } = req.body;
    const key = generateKey();
    const expiresAt = getExpiryDate();
    
    db.run(
        'INSERT INTO activations (key, email, expires_at) VALUES (?, ?, ?)',
        [key, email || null, expiresAt],
        function(err) {
            if (err) {
                console.error('Error generating key:', err);
                return res.status(500).json({ error: 'Failed to generate key' });
            }
            
            // Log the action
            db.run(
                'INSERT INTO usage_logs (key, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                [key, 'generated', req.ip, req.get('user-agent')]
            );
            
            res.json({
                success: true,
                key,
                expiresAt,
                message: '30-day trial key generated'
            });
        }
    );
});

// Verify activation key
app.get('/api/verify/:key', (req, res) => {
    const { key } = req.params;
    
    if (!key || key.length !== 32) {
        return res.status(400).json({ error: 'Invalid key format' });
    }
    
    db.get(
        'SELECT * FROM activations WHERE key = ? AND status = ?',
        [key.toUpperCase(), 'active'],
        (err, row) => {
            if (err) {
                console.error('Error verifying key:', err);
                return res.status(500).json({ error: 'Verification failed' });
            }
            
            if (!row) {
                return res.json({ valid: false, message: 'Invalid or expired key' });
            }
            
            // Check if expired
            const now = new Date();
            const expiresAt = new Date(row.expires_at);
            
            if (now > expiresAt) {
                // Mark as expired
                db.run('UPDATE activations SET status = ? WHERE key = ?', ['expired', key.toUpperCase()]);
                return res.json({ valid: false, message: 'Key has expired' });
            }
            
            // Log the verification
            db.run(
                'INSERT INTO usage_logs (key, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                [key.toUpperCase(), 'verified', req.ip, req.get('user-agent')]
            );
            
            // Calculate days remaining
            const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
            
            res.json({
                valid: true,
                expiresAt: row.expires_at,
                daysRemaining,
                message: `Key valid for ${daysRemaining} more days`
            });
        }
    );
});

// Deactivate key
app.post('/api/deactivate/:key', (req, res) => {
    const { key } = req.params;
    
    db.run(
        'UPDATE activations SET status = ? WHERE key = ?',
        ['deactivated', key.toUpperCase()],
        function(err) {
            if (err) {
                console.error('Error deactivating key:', err);
                return res.status(500).json({ error: 'Deactivation failed' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Key not found' });
            }
            
            // Log the action
            db.run(
                'INSERT INTO usage_logs (key, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                [key.toUpperCase(), 'deactivated', req.ip, req.get('user-agent')]
            );
            
            res.json({ success: true, message: 'Key deactivated' });
        }
    );
});

// Admin: Get all activations (protected - add auth in production)
app.get('/api/admin/activations', (req, res) => {
    // TODO: Add authentication
    db.all(
        'SELECT id, key, email, activated_at, expires_at, status, created_at FROM activations ORDER BY created_at DESC LIMIT 100',
        (err, rows) => {
            if (err) {
                console.error('Error fetching activations:', err);
                return res.status(500).json({ error: 'Failed to fetch activations' });
            }
            res.json({ activations: rows });
        }
    );
});

// Admin: Get usage logs
app.get('/api/admin/logs', (req, res) => {
    // TODO: Add authentication
    db.all(
        'SELECT * FROM usage_logs ORDER BY timestamp DESC LIMIT 100',
        (err, rows) => {
            if (err) {
                console.error('Error fetching logs:', err);
                return res.status(500).json({ error: 'Failed to fetch logs' });
            }
            res.json({ logs: rows });
        }
    );
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Activation server running on port ${PORT}`);
    console.log(`📊 Database: ${dbPath}`);
    console.log(`🔒 CORS origins: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing database...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        }
        process.exit(0);
    });
});

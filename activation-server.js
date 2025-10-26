const http = require('http');
const crypto = require('crypto');
const url = require('url');

// In-memory storage (replace with database in production)
const activations = new Map();

// Rate limiting storage
const rateLimit = new Map();

// CORS headers - restrict to known origins
function getCorsHeaders(origin) {
    const allowedOrigins = [
        'https://cupidbot.org',
        'https://cupid-otys.vercel.app',
        'http://localhost:3000'
    ];
    
    const headers = {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    
    if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
    }
    
    return headers;
}

// Rate limiting function
function checkRateLimit(ip) {
    const now = Date.now();
    const limit = rateLimit.get(ip) || { count: 0, resetTime: now + 3600000 }; // 1 hour window
    
    // Reset if window expired
    if (now > limit.resetTime) {
        limit.count = 0;
        limit.resetTime = now + 3600000;
    }
    
    // Check if limit exceeded (5 requests per hour)
    if (limit.count >= 5) {
        return false;
    }
    
    // Increment counter
    limit.count++;
    rateLimit.set(ip, limit);
    return true;
}

// Cleanup old rate limit entries every hour
setInterval(() => {
    const now = Date.now();
    for (const [ip, limit] of rateLimit.entries()) {
        if (now > limit.resetTime + 3600000) {
            rateLimit.delete(ip);
        }
    }
}, 3600000);

// Generate cryptographically secure activation key
function generateActivationKey() {
    // Use crypto.randomBytes for CSPRNG
    const buffer = crypto.randomBytes(12);
    const key = buffer.toString('base64')
        .replace(/\+/g, '')
        .replace(/\//g, '')
        .replace(/=/g, '')
        .toUpperCase()
        .match(/.{1,4}/g)
        .join('-');
    
    return key;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const origin = req.headers.origin || '';
    const corsHeaders = getCorsHeaders(origin);
    
    // Get client IP for rate limiting
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                     req.socket.remoteAddress;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }

    // POST /api/activate - Generate activation key
    if (pathname === '/api/activate' && req.method === 'POST') {
        // Check rate limit
        if (!checkRateLimit(clientIP)) {
            res.writeHead(429, corsHeaders);
            res.end(JSON.stringify({
                success: false,
                error: 'Rate limit exceeded. Maximum 5 activation requests per hour.',
                retryAfter: 3600
            }));
            console.log(`[${new Date().toISOString()}] Rate limit exceeded for IP: ${clientIP}`);
            return;
        }
        
        let body = '';
        const MAX_BODY_SIZE = 10 * 1024; // 10KB limit
        let bodySize = 0;

        req.on('data', chunk => {
            bodySize += chunk.length;
            if (bodySize > MAX_BODY_SIZE) {
                res.writeHead(413, corsHeaders);
                res.end(JSON.stringify({
                    success: false,
                    error: 'Request body too large'
                }));
                req.destroy();
                return;
            }
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const email = data.email;

                // Validate email
                if (!email || !isValidEmail(email)) {
                    res.writeHead(400, corsHeaders);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Invalid email address'
                    }));
                    return;
                }

                // Check if email already has a key
                if (activations.has(email)) {
                    const existingKey = activations.get(email);
                    res.writeHead(200, corsHeaders);
                    res.end(JSON.stringify({
                        success: true,
                        key: existingKey.key,
                        message: 'Existing activation key retrieved'
                    }));
                    return;
                }

                // Generate new activation key
                const activationKey = generateActivationKey();
                const timestamp = new Date().toISOString();

                // Store activation
                activations.set(email, {
                    key: activationKey,
                    email: email,
                    created: timestamp,
                    used: false
                });

                console.log(`[${timestamp}] New activation key generated for: ${email}`);

                // Return success response
                res.writeHead(200, corsHeaders);
                res.end(JSON.stringify({
                    success: true,
                    key: activationKey,
                    email: email
                }));

            } catch (error) {
                console.error('Error processing request:', error);
                res.writeHead(500, corsHeaders);
                res.end(JSON.stringify({
                    success: false,
                    error: 'Internal server error'
                }));
            }
        });

        return;
    }

    // GET /api/verify/:key - Verify activation key
    if (pathname.startsWith('/api/verify/') && req.method === 'GET') {
        const key = pathname.split('/api/verify/')[1];

        // Find activation by key
        let found = false;
        for (const [email, activation] of activations.entries()) {
            if (activation.key === key) {
                found = true;
                res.writeHead(200, corsHeaders);
                res.end(JSON.stringify({
                    success: true,
                    valid: true,
                    email: email,
                    used: activation.used
                }));
                break;
            }
        }

        if (!found) {
            res.writeHead(404, corsHeaders);
            res.end(JSON.stringify({
                success: false,
                valid: false,
                error: 'Activation key not found'
            }));
        }

        return;
    }

    // GET /api/stats - Get server stats (for monitoring)
    if (pathname === '/api/stats' && req.method === 'GET') {
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
            success: true,
            totalActivations: activations.size,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }));
        return;
    }

    // 404 for all other routes
    res.writeHead(404, corsHeaders);
    res.end(JSON.stringify({
        success: false,
        error: 'Endpoint not found'
    }));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🔑 CupidBot Activation Server');
    console.log('='.repeat(60));
    console.log(`Server running on port ${PORT}`);
    console.log(`\nEndpoints:`);
    console.log(`  POST   /api/activate     - Generate activation key`);
    console.log(`  GET    /api/verify/:key  - Verify activation key`);
    console.log(`  GET    /api/stats        - Server statistics`);
    console.log('\nSecurity Features:');
    console.log(`  ✓ Rate limiting: 5 requests per hour per IP`);
    console.log(`  ✓ Request body size limit: 10KB`);
    console.log(`  ✓ Restricted CORS origins`);
    console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

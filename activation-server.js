const http = require('http');
const crypto = require('crypto');
const url = require('url');

// In-memory storage (replace with database in production)
const activations = new Map();

// CORS headers for development
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

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

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }

    // POST /api/activate - Generate activation key
    if (pathname === '/api/activate' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
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

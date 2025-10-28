# CupidBot Activation Server v2

Professional activation key management server with SQLite database persistence.

## Features

- ✅ SQLite database for persistent storage
- ✅ 30-day trial key generation
- ✅ Key verification and expiry checking
- ✅ Rate limiting (10 requests/hour per IP)
- ✅ CORS protection
- ✅ Usage logging
- ✅ Admin endpoints
- ✅ Docker support
- ✅ Health checks

## API Endpoints

### Public Endpoints

#### Generate Key
```bash
POST /api/generate
Content-Type: application/json

{
  "email": "user@example.com"  # optional
}

Response:
{
  "success": true,
  "key": "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
  "expiresAt": "2025-11-27T04:00:00.000Z",
  "message": "30-day trial key generated"
}
```

#### Verify Key
```bash
GET /api/verify/:key

Response (valid):
{
  "valid": true,
  "expiresAt": "2025-11-27T04:00:00.000Z",
  "daysRemaining": 25,
  "message": "Key valid for 25 more days"
}

Response (invalid):
{
  "valid": false,
  "message": "Invalid or expired key"
}
```

#### Deactivate Key
```bash
POST /api/deactivate/:key

Response:
{
  "success": true,
  "message": "Key deactivated"
}
```

### Admin Endpoints (TODO: Add authentication)

#### List All Activations
```bash
GET /api/admin/activations

Response:
{
  "activations": [
    {
      "id": 1,
      "key": "...",
      "email": "user@example.com",
      "activated_at": "2025-10-28T04:00:00.000Z",
      "expires_at": "2025-11-27T04:00:00.000Z",
      "status": "active",
      "created_at": "2025-10-28T04:00:00.000Z"
    }
  ]
}
```

#### View Usage Logs
```bash
GET /api/admin/logs

Response:
{
  "logs": [
    {
      "id": 1,
      "key": "...",
      "action": "verified",
      "ip_address": "1.2.3.4",
      "user_agent": "...",
      "timestamp": "2025-10-28T04:00:00.000Z"
    }
  ]
}
```

## Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Development with auto-reload
npm run dev
```

## Docker Deployment

```bash
# Build image
docker build -t activation-server .

# Run container
docker run -d \
  -p 3001:3001 \
  -v $(pwd)/data:/data \
  -e FRONTEND_URL=https://your-frontend.com \
  activation-server
```

## Render Deployment

1. Create new Web Service on Render
2. Connect to GitHub repository
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-frontend.com`
6. Add persistent disk at `/data` for database

## Environment Variables

- `PORT` - Server port (default: 3001)
- `DB_PATH` - SQLite database path (default: ./activations.db)
- `FRONTEND_URL` - Additional CORS origin
- `NODE_ENV` - Environment (production/development)

## Database Schema

### activations table
- `id` - Primary key
- `key` - Unique activation key (32 chars)
- `email` - Optional user email
- `activated_at` - When key was first used
- `expires_at` - Expiry date (30 days from creation)
- `status` - active/expired/deactivated
- `created_at` - Creation timestamp

### usage_logs table
- `id` - Primary key
- `key` - Activation key
- `action` - generated/verified/deactivated
- `ip_address` - Client IP
- `user_agent` - Client user agent
- `timestamp` - Action timestamp

## Security Notes

- Rate limiting: 10 requests/hour per IP
- CORS restricted to known origins
- Admin endpoints need authentication (TODO)
- Database stored on persistent disk
- All keys are 32-character hex strings
- Keys are case-insensitive (stored uppercase)

## Testing

```bash
# Generate key
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify key
curl http://localhost:3001/api/verify/YOUR_KEY_HERE

# Deactivate key
curl -X POST http://localhost:3001/api/deactivate/YOUR_KEY_HERE

# Health check
curl http://localhost:3001/health
```

## Migration from v1

The old activation-server.js used in-memory storage. This v2:
- ✅ Persists data to SQLite database
- ✅ Survives server restarts
- ✅ Tracks usage history
- ✅ Supports admin operations
- ✅ Production-ready with Docker

## TODO

- [ ] Add admin authentication
- [ ] Add email notifications
- [ ] Add payment integration
- [ ] Add key renewal endpoint
- [ ] Add analytics dashboard
- [ ] Add backup/restore functionality

# Render Environment Variables Configuration

## Required Environment Variables

Set these variables in your Render dashboard for the spark-backend service:

### 1. PORT
- **Value**: `8000`
- **Purpose**: Port for the server to listen on
- **Note**: Render will map this to an external port automatically

### 2. GO_ENV
- **Value**: `production`
- **Purpose**: Sets Go environment to production mode
- **Note**: Enables production optimizations and logging

### 3. SPARK_SALT
- **Value**: `a2dac101827c8d47f00831f2d6c078b2`
- **Purpose**: 32-character salt for packet encryption
- **Security**: MUST match the salt in config.json
- **Note**: Used to encrypt all communication between client and server

### 4. SPARK_ADMIN_HASH
- **Value**: `$2b$10$RYCAuSMeNE1uh2/qka5PSeE6RFjynbpXu95HMStXmUHA8qaQNBFjG`
- **Purpose**: Bcrypt hash of admin password
- **Security**: Password is "ChangeMe2024!SecurePassword"
- **Note**: Used for dashboard authentication

## How to Set Environment Variables in Render

1. Go to https://dashboard.render.com
2. Select your spark-backend service
3. Click on "Environment" tab
4. Click "Add Environment Variable" for each variable above
5. Enter the variable name and value exactly as shown
6. Click "Save Changes"
7. Redeploy the service

## Security Notes

- **SPARK_SALT**: This salt is used to encrypt all packets between client and server
- **SPARK_ADMIN_HASH**: This is the bcrypt hash of the admin password
- **Never commit these values to Git** - they are sensitive credentials
- **Rotate these values every 90 days** for security
- **Use different values for production vs development**

## Verification

After setting these variables and deploying:

1. Check Render logs for:
   ```
   Server starting on port 8000
   Salt loaded from environment
   Admin auth configured
   ```

2. Test health endpoint:
   ```bash
   curl https://your-service.onrender.com/api/info
   ```

3. Expected response:
   ```json
   {"version":"1.0.0","uptime":"5s","clients":0}
   ```

## Troubleshooting

- **Server won't start**: Check all environment variables are set correctly
- **Authentication fails**: Verify SPARK_ADMIN_HASH matches config.json
- **Client can't connect**: Verify SPARK_SALT matches client configuration
- **Port binding error**: Ensure PORT=8000 is set

## Next Steps

After setting these environment variables:
1. Deploy the backend to Render
2. Test the health endpoint
3. Configure the frontend to connect to the backend
4. Build and distribute clients with matching salt
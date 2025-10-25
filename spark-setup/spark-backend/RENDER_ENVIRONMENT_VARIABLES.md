# Render Environment Variables Configuration

## Required Environment Variables for Render Deployment

Set these environment variables in your Render dashboard for the spark-backend service:

### Core Configuration
- **PORT**: `8000` (Render will automatically assign this, but we set it for consistency)
- **GO_ENV**: `production` (Enables production optimizations)

### Security Configuration (CRITICAL)
- **SPARK_SALT**: `72415144205a3a1f5618223832aecbed` (32-character hex string for packet encryption)
- **SPARK_ADMIN_HASH**: `$2b$10$Jbxck.MpAVkEZy.jM.z0Rufztx4WGfj//IhyOyBqsQp4nLWvr.em6` (Bcrypt hash of admin password)

### Optional Configuration
- **SPARK_LOG_LEVEL**: `info` (Logging level: debug, info, warn, error)
- **SPARK_LOG_PATH**: `./logs` (Directory for log files)
- **SPARK_LOG_DAYS**: `7` (Number of days to keep logs)

## How to Set Environment Variables in Render

1. Go to https://dashboard.render.com
2. Select your spark-backend service
3. Click on "Environment" tab
4. Add each variable with its corresponding value
5. Click "Save Changes"
6. Redeploy the service

## Security Notes

- **NEVER** commit the actual salt or password hash to version control
- The salt must be the same on both server and client for encryption to work
- The admin password is: `ChangeMe2024!SecurePassword` (change this in production!)
- Consider rotating these credentials regularly in production

## Verification

After setting these variables and deploying, check the Render logs to ensure:
- Server starts on the correct port
- Salt is loaded from environment
- Admin authentication is configured
- No configuration errors appear in logs
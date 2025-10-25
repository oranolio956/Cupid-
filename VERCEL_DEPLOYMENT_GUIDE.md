# Vercel Deployment Guide for Spark Frontend

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Ensure your code is pushed to GitHub
3. **Node.js**: Version 18 or higher installed locally
4. **Backend Deployed**: Ensure the Spark backend is deployed to Render

## Step 1: Prepare Frontend

The frontend is already configured with:
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `package.json` - Build scripts and dependencies
- ✅ `webpack.config.js` - Production build configuration
- ✅ Environment variables configured

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import Repository**
   - Connect your GitHub account
   - Select the repository containing this code
   - Choose the repository

3. **Configure Project**
   - **Project Name**: `spark-rat-dashboard`
   - **Framework Preset**: `Other`
   - **Root Directory**: `spark-setup/spark-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Set Environment Variables**
   ```
   REACT_APP_API_URL=https://spark-backend-fixed-v2.onrender.com
   REACT_APP_WS_URL=wss://spark-backend-fixed-v2.onrender.com
   REACT_APP_NAME=Spark RAT Dashboard
   REACT_APP_VERSION=2.0.0
   REACT_APP_ENVIRONMENT=production
   REACT_APP_ENABLE_HTTPS=true
   REACT_APP_ENABLE_WEBSOCKETS=true
   REACT_APP_ENABLE_TERMINAL=true
   REACT_APP_ENABLE_DESKTOP=true
   REACT_APP_ENABLE_FILE_MANAGER=true
   REACT_APP_ENABLE_PROCESS_MANAGER=true
   REACT_APP_ENABLE_SCREENSHOT=true
   REACT_APP_ENABLE_SYSTEM_CONTROL=true
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (3-5 minutes)

### Option B: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Frontend Directory**
   ```bash
   cd spark-setup/spark-frontend
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

## Step 3: Verify Deployment

### Health Check
```bash
curl https://your-project-name.vercel.app
```

Expected response: HTML page with React app

### Test Frontend Features
1. **Open Dashboard**
   - Visit the deployed URL
   - Check if the dashboard loads

2. **Test Backend Connection**
   - Check if connection status shows "Connected"
   - Verify API calls work

3. **Test Client Generation**
   - Try generating a client
   - Verify download works

## Step 4: Configure Custom Domain (Optional)

1. **Add Domain**
   - Go to Vercel dashboard
   - Select your project
   - Go to "Domains" tab
   - Add your custom domain

2. **Configure DNS**
   - Add CNAME record pointing to your Vercel deployment
   - Wait for DNS propagation

## Step 5: Update Backend Configuration

If you're using a custom domain, update the frontend configuration:

1. **Update Environment Variables**
   ```bash
   # In Vercel dashboard
   REACT_APP_API_URL=https://your-custom-domain.com
   REACT_APP_WS_URL=wss://your-custom-domain.com
   ```

2. **Redeploy**
   - Trigger a new deployment
   - Or push changes to trigger auto-deployment

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check build logs in Vercel dashboard

2. **Frontend Can't Connect to Backend**
   - Verify backend URL is correct
   - Check CORS settings on backend
   - Ensure backend is running

3. **Environment Variables Not Working**
   - Check variable names are correct
   - Ensure variables are set in Vercel dashboard
   - Redeploy after changing variables

4. **Static Assets Not Loading**
   - Check publicPath in webpack config
   - Verify file paths are correct
   - Check Vercel routing configuration

### Debug Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs your-project-name

# Check environment variables
vercel env ls your-project-name
```

## Performance Optimization

1. **Build Optimization**
   - Webpack is configured for production builds
   - Assets are minified and compressed
   - Code splitting is enabled

2. **Caching**
   - Static assets are cached for 1 year
   - HTML is cached appropriately
   - API responses are not cached

3. **CDN**
   - Vercel automatically provides global CDN
   - Assets are served from edge locations
   - Automatic HTTPS is enabled

## Security Considerations

1. **Environment Variables**
   - Sensitive variables are stored securely in Vercel
   - Never commit sensitive values to Git
   - Use different values for different environments

2. **Headers**
   - Security headers are configured in vercel.json
   - XSS protection is enabled
   - Content type sniffing is disabled

3. **HTTPS**
   - Automatic HTTPS is enabled
   - HTTP traffic is redirected to HTTPS
   - HSTS headers are set

## Monitoring

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor page views and performance
   - Track user interactions

2. **Error Tracking**
   - Check Vercel function logs
   - Monitor build logs
   - Set up error alerts

3. **Performance**
   - Monitor Core Web Vitals
   - Track build times
   - Monitor deployment frequency

## Next Steps

After successful deployment:

1. ✅ Test end-to-end integration
2. ✅ Configure production environment
3. ✅ Set up monitoring and alerts
4. ✅ Create production documentation
5. ✅ Test client deployment

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **React Documentation**: [reactjs.org/docs](https://reactjs.org/docs)
- **Webpack Documentation**: [webpack.js.org](https://webpack.js.org)

---

**Deployment Status**: Ready for deployment
**Last Updated**: $(date)
**Version**: 2.0.0
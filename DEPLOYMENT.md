# Deployment Guide

This document provides comprehensive instructions for deploying the Actual Chess App to production, managing environment variables, and maintaining the CI/CD pipeline.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [CI/CD Pipeline Overview](#cicd-pipeline-overview)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Providers](#deployment-providers)
5. [Monitoring and Alerts](#monitoring-and-alerts)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying the application, ensure you have:

- A GitHub account with repository access
- A Vercel account (or alternative hosting provider)
- Required API keys (Gemini AI API Key)
- Admin access to configure GitHub Secrets

---

## CI/CD Pipeline Overview

The automated CI/CD pipeline is implemented using GitHub Actions and consists of the following stages:

### Pipeline Stages

1. **Lint** - Code quality checks and TypeScript validation
2. **Build** - Production build creation with optimized assets
3. **Deploy** - Automatic deployment to Vercel (production environment)
4. **Health Check** - Post-deployment verification

### Workflow Triggers

The pipeline is triggered on:
- **Push to main branch**: Full pipeline with deployment
- **Pull requests to main**: Build and preview deployment (without production deployment)
- **Manual trigger**: Via workflow_dispatch event

### Workflow Files

- `.github/workflows/ci-cd-production.yml` - Main CI/CD pipeline
- `.github/workflows/security.yml` - Security audits and dependency checks

---

## Environment Configuration

### Required Environment Variables

The application requires the following environment variables for production:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini AI API key for chess engine | Yes | `AIza...` |
| `REACT_APP_ADAPTER_API_BASE` | Backend adapter API base URL | Optional | `https://your-backend-url.com` |
| `VERCEL_TOKEN` | Vercel deployment token | Yes (for Vercel) | Generated from Vercel dashboard |
| `VERCEL_ORG_ID` | Vercel organization ID | Yes (for Vercel) | Found in Vercel project settings |
| `VERCEL_PROJECT_ID` | Vercel project ID | Yes (for Vercel) | Found in Vercel project settings |

### Setting Up GitHub Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each required secret:

#### Step-by-Step Secret Configuration

**GEMINI_API_KEY:**
```
Name: GEMINI_API_KEY
Value: Your Google Gemini API key
```

**REACT_APP_ADAPTER_API_BASE:**
```
Name: REACT_APP_ADAPTER_API_BASE
Value: https://your-backend-url.com
```

**VERCEL_TOKEN:**
```
Name: VERCEL_TOKEN
Value: Your Vercel token (from Vercel Settings → Tokens)
```

**VERCEL_ORG_ID:**
```
Name: VERCEL_ORG_ID
Value: Your Vercel organization ID (found in project settings)
```

**VERCEL_PROJECT_ID:**
```
Name: VERCEL_PROJECT_ID
Value: Your Vercel project ID (found in project settings)
```

### Local Development Environment

For local development, use the `.env` file:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your local credentials
nano .env
```

**Never commit the `.env` file to version control.**

---

## Deployment Providers

### Vercel (Recommended)

Vercel is the recommended deployment platform for this React + Vite application.

#### Initial Vercel Setup

1. **Create a Vercel Account:**
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Your Project:**
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings:
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`

3. **Get Deployment Credentials:**
   - **Token:** Settings → Tokens → Create Token
   - **Org ID:** Project Settings → General → Organization ID
   - **Project ID:** Project Settings → General → Project ID

4. **Configure Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add `GEMINI_API_KEY` and `REACT_APP_ADAPTER_API_BASE`
   - Apply to Production, Preview, and Development environments

#### Vercel CLI (Optional)

For manual deployments:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Alternative Providers

#### Netlify

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configure environment variables in Netlify dashboard

#### AWS Amplify

1. Connect GitHub repository in AWS Amplify Console
2. Build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

#### GitHub Pages

For static hosting without backend:

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add deploy script to package.json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

---

## Monitoring and Alerts

### Application Monitoring

#### Vercel Analytics (Built-in)

Vercel provides built-in analytics for deployed applications:

1. Navigate to your Vercel project
2. Click on "Analytics" tab
3. View metrics:
   - Page views
   - Performance (Web Vitals)
   - Traffic sources
   - Error rates

#### Recommended External Monitoring Tools

**1. Sentry (Error Tracking)**

Add Sentry for comprehensive error tracking:

```bash
npm install @sentry/react
```

Configure in your app:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

**2. LogRocket (Session Replay)**

```bash
npm install logrocket
```

**3. Google Analytics (Traffic Monitoring)**

Add to `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### Health Checks

#### Implementing a Health Check Endpoint

If you have a backend, implement a `/health` endpoint:

```typescript
// Example backend health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

#### Configuring Health Check in CI/CD

Update `.github/workflows/ci-cd-production.yml`:

```yaml
- name: Health Check
  run: |
    HEALTH_URL="${{ steps.deployment.outputs.url }}/health"
    response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
    if [ $response -eq 200 ]; then
      echo "✅ Health check passed"
    else
      echo "❌ Health check failed with status $response"
      exit 1
    fi
```

### Alert Configuration

#### GitHub Actions Notifications

Configure Slack notifications for deployment status:

```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### Vercel Deployment Notifications

1. Go to Vercel Project Settings → Notifications
2. Configure:
   - Deployment Failed
   - Deployment Ready
   - Comments on Pull Requests

---

## Troubleshooting

### Common Issues and Solutions

#### Build Failures

**Issue:** Build fails with "Module not found" error
```
Solution:
1. Clear npm cache: npm cache clean --force
2. Delete node_modules: rm -rf node_modules
3. Reinstall dependencies: npm install
4. Rebuild: npm run build
```

**Issue:** Environment variables not loaded
```
Solution:
1. Verify secrets are set in GitHub Settings → Secrets
2. Check variable names match exactly (case-sensitive)
3. Ensure secrets are available to the workflow (environment settings)
```

#### Deployment Failures

**Issue:** Vercel deployment fails
```
Solution:
1. Verify VERCEL_TOKEN is valid (may expire)
2. Check VERCEL_ORG_ID and VERCEL_PROJECT_ID are correct
3. Review Vercel project settings match workflow configuration
4. Check Vercel build logs for specific errors
```

**Issue:** 404 errors on deployed site
```
Solution:
1. Verify dist folder contains index.html
2. Check Vercel output directory is set to "dist"
3. Add vercel.json for SPA routing:
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
```

#### Performance Issues

**Issue:** Slow load times
```
Solution:
1. Enable Vercel Edge Network (automatic)
2. Optimize bundle size:
   - Analyze bundle: npx vite-bundle-visualizer
   - Code split large dependencies
   - Lazy load routes
3. Compress images and assets
4. Enable Vite build optimizations
```

### Getting Help

- **GitHub Issues:** Report bugs or request features
- **Vercel Support:** support@vercel.com
- **Community:** GitHub Discussions

---

## Updating the Deployment Pipeline

### Adding New Build Steps

Edit `.github/workflows/ci-cd-production.yml`:

```yaml
- name: Custom Build Step
  run: |
    # Your custom commands
    echo "Running custom step..."
```

### Changing Node.js Version

Update the `NODE_VERSION` environment variable:

```yaml
env:
  NODE_VERSION: '22.12'  # Change version here
```

### Adding Additional Environments

Create environment-specific workflows:

```yaml
# .github/workflows/staging-deployment.yml
name: Deploy to Staging
on:
  push:
    branches: [ develop ]
```

### Modifying Deployment Provider

To switch from Vercel to another provider:

1. Replace the deployment step in the workflow
2. Update required secrets
3. Test the deployment
4. Update this documentation

---

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Rotate API keys** regularly
3. **Use environment-specific** configurations
4. **Enable two-factor authentication** on all accounts
5. **Review deployment logs** for suspicious activity
6. **Keep dependencies updated** (run `npm audit` regularly)
7. **Use HTTPS** for all API endpoints
8. **Implement rate limiting** on backend APIs
9. **Monitor for vulnerabilities** with GitHub Dependabot
10. **Regular security audits** via `.github/workflows/security.yml`

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Production Build Guide](https://vitejs.dev/guide/build.html)
- [React Production Optimization](https://react.dev/learn/production)

---

**Last Updated:** 2025-10-23  
**Maintained By:** @Joedaddy66

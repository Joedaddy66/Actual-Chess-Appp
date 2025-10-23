# Monitoring and Health Check Guide

This document provides comprehensive guidance on monitoring the Actual Chess App in production, setting up alerts, and maintaining application health.

## Table of Contents

1. [Overview](#overview)
2. [Application Metrics](#application-metrics)
3. [Monitoring Tools Setup](#monitoring-tools-setup)
4. [Health Check Implementation](#health-check-implementation)
5. [Alert Configuration](#alert-configuration)
6. [Performance Monitoring](#performance-monitoring)
7. [Log Management](#log-management)
8. [Incident Response](#incident-response)

---

## Overview

Effective monitoring ensures your application remains healthy, performant, and available to users. This guide covers:

- Real-time application metrics
- Error tracking and reporting
- Performance monitoring
- Uptime monitoring
- Alert configuration

---

## Application Metrics

### Key Performance Indicators (KPIs)

Track these critical metrics for your application:

| Metric | Target | Description | Priority |
|--------|--------|-------------|----------|
| **Uptime** | 99.9% | Application availability | Critical |
| **Response Time** | < 2s | Average page load time | High |
| **Error Rate** | < 1% | Percentage of failed requests | Critical |
| **API Latency** | < 10ms | Backend response time (RTT) | High |
| **Cost per Move** | < $0.01 | AI inference cost | Medium |
| **Carbon per Move** | < 0.1g CO₂ | Environmental impact | Low |

### Business Metrics

- **Daily Active Users (DAU)**
- **Chess games played**
- **Average game duration**
- **AI move accuracy**
- **User retention rate**

---

## Monitoring Tools Setup

### 1. Vercel Analytics (Built-in)

Vercel provides built-in analytics for all deployed projects.

**Setup:**
- Automatically enabled for all Vercel projects
- No additional configuration required

**Features:**
- Real-time visitor tracking
- Web Vitals (LCP, FID, CLS)
- Page view analytics
- Traffic sources

**Access:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click "Analytics" tab

### 2. Sentry (Error Tracking)

Comprehensive error tracking and performance monitoring.

**Installation:**

```bash
npm install @sentry/react @sentry/vite-plugin
```

**Configuration:**

Create `src/sentry.config.ts`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "production",
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});
```

Update `index.tsx`:

```typescript
import './sentry.config';
```

**GitHub Secret:**
```
Name: SENTRY_DSN
Value: https://[key]@[org].ingest.sentry.io/[project]
```

**Vite Configuration:**

Update `vite.config.ts`:

```typescript
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    }),
  ],
});
```

### 3. LogRocket (Session Replay)

Record and replay user sessions for debugging.

**Installation:**

```bash
npm install logrocket
```

**Configuration:**

Create `src/logrocket.config.ts`:

```typescript
import LogRocket from 'logrocket';

if (process.env.NODE_ENV === 'production') {
  LogRocket.init('your-app-id/your-project-name');
  
  // Identify users
  LogRocket.identify('USER_ID', {
    name: 'User Name',
    email: 'user@example.com',
  });
}
```

### 4. Uptime Monitoring

Use external services to monitor application availability.

#### UptimeRobot

1. Visit [uptimerobot.com](https://uptimerobot.com)
2. Create a new monitor:
   - **Type:** HTTP(s)
   - **URL:** Your production URL
   - **Interval:** 5 minutes
3. Configure alerts (email, SMS, Slack)

#### Pingdom

1. Visit [pingdom.com](https://pingdom.com)
2. Add new check:
   - **Type:** Uptime
   - **URL:** Your production URL
3. Set up alert contacts

### 5. Google Analytics

Track user behavior and traffic.

**Setup:**

Add to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Health Check Implementation

### Frontend Health Check

Create `public/health.json`:

```json
{
  "status": "healthy",
  "service": "actual-chess-app",
  "version": "1.0.0"
}
```

### Backend Health Check

If using a backend adapter, implement:

```typescript
// Example Express.js health endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      database: 'connected',
      geminiAPI: 'available',
      memory: process.memoryUsage(),
    }
  };
  
  res.status(200).json(health);
});
```

### Health Check Automation

Update `.github/workflows/ci-cd-production.yml`:

```yaml
- name: Advanced Health Check
  run: |
    echo "🏥 Running comprehensive health check..."
    
    # Check if site is accessible
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${{ steps.deployment.outputs.url }})
    
    if [ $STATUS -eq 200 ]; then
      echo "✅ Site is accessible (HTTP $STATUS)"
    else
      echo "❌ Site returned HTTP $STATUS"
      exit 1
    fi
    
    # Check response time
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" ${{ steps.deployment.outputs.url }})
    echo "⏱️  Response time: ${RESPONSE_TIME}s"
    
    # Check for critical assets
    curl -s ${{ steps.deployment.outputs.url }}/assets/ | grep -q "index" || exit 1
    echo "✅ Critical assets verified"
```

---

## Alert Configuration

### GitHub Actions Notifications

#### Slack Integration

Add Slack webhook for deployment notifications:

```yaml
- name: Notify Slack on Failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: '🚨 Deployment failed for ${{ github.repository }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    
- name: Notify Slack on Success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: '✅ Successfully deployed to production'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**Setup Slack Webhook:**
1. Go to Slack → Apps → Incoming Webhooks
2. Create webhook for your channel
3. Add to GitHub Secrets as `SLACK_WEBHOOK`

#### Email Notifications

GitHub Actions automatically sends emails for workflow failures to:
- Committer
- Repository watchers (if configured)

Configure in: Settings → Notifications → Actions

#### Discord Integration

```yaml
- name: Notify Discord
  if: always()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    status: ${{ job.status }}
    title: "Deployment Status"
    description: "Deployment to production"
```

### Sentry Alerts

Configure alerts in Sentry dashboard:

1. **Error Rate Spike:**
   - Threshold: > 10 errors in 1 minute
   - Action: Email + Slack notification

2. **New Issue Detection:**
   - Trigger: First occurrence of new error
   - Action: Email to team

3. **Performance Degradation:**
   - Threshold: P95 latency > 3 seconds
   - Action: Slack notification

### Custom Monitoring Script

Create a monitoring script for regular health checks:

```bash
#!/bin/bash
# health-monitor.sh

URL="https://your-app.vercel.app"
SLACK_WEBHOOK="your-webhook-url"

check_health() {
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)
  
  if [ $STATUS -ne 200 ]; then
    # Send alert
    curl -X POST $SLACK_WEBHOOK \
      -H 'Content-Type: application/json' \
      -d "{\"text\": \"🚨 Health check failed! Status: $STATUS\"}"
    return 1
  fi
  return 0
}

# Run check
check_health
```

Schedule with cron:
```bash
# Run every 5 minutes
*/5 * * * * /path/to/health-monitor.sh
```

---

## Performance Monitoring

### Web Vitals Tracking

Monitor Core Web Vitals using `web-vitals` package:

```bash
npm install web-vitals
```

Configure in your app:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics endpoint
  console.log(metric);
  
  // Or send to Sentry
  if (window.Sentry) {
    window.Sentry.captureMessage(`${metric.name}: ${metric.value}`);
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Performance Budgets

Set performance budgets in `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          gemini: ['@google/genai']
        }
      }
    },
    // Warn if chunk exceeds 500kb
    chunkSizeWarningLimit: 500,
  }
});
```

### Bundle Analysis

Analyze bundle size:

```bash
# Install analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
});

# Run build to see analysis
npm run build
```

---

## Log Management

### Vercel Logs

Access deployment logs:

1. Vercel Dashboard → Project → Deployments
2. Click on specific deployment
3. View "Build Logs" and "Runtime Logs"

### Centralized Logging

For comprehensive log management, use:

#### Datadog Logs

```bash
npm install @datadog/browser-logs
```

```typescript
import { datadogLogs } from '@datadog/browser-logs';

datadogLogs.init({
  clientToken: process.env.DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  forwardErrorsToLogs: true,
  sampleRate: 100,
});
```

#### Papertrail

Centralized log aggregation:

1. Sign up at [papertrailapp.com](https://papertrailapp.com)
2. Configure log forwarding from Vercel
3. Set up search alerts

---

## Incident Response

### Response Workflow

1. **Detection**
   - Alert received via Slack/email
   - Automated health check failure
   - User report

2. **Assessment**
   - Check Vercel deployment status
   - Review Sentry error reports
   - Analyze logs

3. **Mitigation**
   - Rollback to previous deployment (if needed)
   - Apply hotfix
   - Update monitoring

4. **Post-Mortem**
   - Document incident
   - Identify root cause
   - Implement preventive measures

### Rollback Procedure

#### Via Vercel Dashboard

1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

#### Via Vercel CLI

```bash
vercel rollback
```

#### Via GitHub

```bash
# Revert last commit and push
git revert HEAD
git push origin main
```

### Emergency Contacts

Maintain an emergency contact list:

- **DevOps Lead:** [contact info]
- **Backend Team:** [contact info]
- **On-Call Engineer:** [rotation schedule]

---

## Monitoring Dashboard

### Recommended Dashboard Layout

Create a monitoring dashboard with:

1. **System Health**
   - Uptime percentage
   - Error rate
   - Active incidents

2. **Performance Metrics**
   - Average response time
   - Web Vitals scores
   - API latency

3. **User Metrics**
   - Active users
   - Geographic distribution
   - Device breakdown

4. **Business Metrics**
   - Games played
   - AI inference count
   - Cost tracking

### Tools for Dashboards

- **Grafana:** Open-source dashboards
- **Datadog:** Comprehensive monitoring
- **New Relic:** Application performance
- **Custom:** Build with React + Chart.js

---

## Best Practices

1. **Set meaningful alerts** - Avoid alert fatigue
2. **Monitor continuously** - Not just during business hours
3. **Test monitoring** - Regularly verify alerts work
4. **Document incidents** - Build knowledge base
5. **Review metrics weekly** - Track trends
6. **Update thresholds** - As application scales
7. **Automate responses** - Where possible
8. **Practice incident response** - Run drills

---

## Resources

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Sentry Documentation](https://docs.sentry.io/)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Google Analytics 4](https://support.google.com/analytics/)

---

**Last Updated:** 2025-10-23  
**Maintained By:** @Joedaddy66

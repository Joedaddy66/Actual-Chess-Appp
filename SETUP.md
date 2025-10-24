# Quick Setup Guide for CI/CD

This guide provides quick setup instructions for getting the CI/CD pipeline operational.

## Prerequisites Checklist

- [ ] GitHub repository access
- [ ] Vercel account created
- [ ] Gemini AI API key obtained
- [ ] Repository admin permissions

## 5-Minute Setup

### Step 1: Vercel Setup (2 minutes)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"**
3. Import `Joedaddy66/Actual-Chess-Appp`
4. Configure:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy** (first deployment)

### Step 2: Get Vercel Credentials (1 minute)

1. **Token**: Settings → Tokens → Create Token
   - Name: `GitHub Actions`
   - Scope: Full Access
   - Copy the token

2. **Project Settings**: 
   - Go to your project → Settings → General
   - Copy **Project ID** (under Project Name)
   - Copy **Organization ID** (under Organization)

### Step 3: Configure GitHub Secrets (2 minutes)

Go to GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these 5 secrets:

| Secret Name | Where to Get It | Example |
|-------------|----------------|---------|
| `GEMINI_API_KEY` | Google AI Studio | `AIza...` |
| `REACT_APP_ADAPTER_API_BASE` | Your backend URL (optional) | `https://api.example.com` |
| `VERCEL_TOKEN` | Vercel → Settings → Tokens | `vercel_token_xyz...` |
| `VERCEL_ORG_ID` | Vercel Project Settings | `team_abc123...` |
| `VERCEL_PROJECT_ID` | Vercel Project Settings | `prj_xyz789...` |

### Step 4: Enable GitHub Actions (30 seconds)

1. Go to repository → Actions tab
2. Click **"I understand my workflows, go ahead and enable them"**

### Step 5: Test Deployment (trigger manually)

1. Go to Actions tab
2. Select **"CI/CD Production Pipeline"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch the pipeline execute

## Verification

After setup, verify:

- ✅ Workflow runs successfully in Actions tab
- ✅ Build artifacts are created
- ✅ Deployment succeeds to Vercel
- ✅ Application is accessible at Vercel URL
- ✅ No console errors in browser

## Common Setup Issues

### Issue: "VERCEL_TOKEN is not valid"
**Solution:** Token may have expired or incorrect scope
- Generate a new token in Vercel
- Ensure "Full Access" scope is selected
- Update GitHub secret

### Issue: "Project not found"
**Solution:** Verify IDs are correct
- Copy fresh IDs from Vercel project settings
- Ensure no extra spaces in GitHub secrets
- Check project exists and you have access

### Issue: Build fails with "npm ci" error
**Solution:** Lock file issue
- Delete `package-lock.json` locally
- Run `npm install`
- Commit new lock file
- Push changes

### Issue: Environment variables not working
**Solution:** Check variable names and availability
- Verify exact names in GitHub Secrets
- Check they're available to workflow (not environment-specific)
- Rebuild after adding secrets

## Next Steps

After successful setup:

1. **Configure Monitoring** - See [MONITORING.md](MONITORING.md)
2. **Set up Alerts** - Add Slack/Discord webhooks
3. **Review Documentation** - Read [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Test Changes** - Create a PR to test the pipeline

## Support

If you encounter issues:

1. Check [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
2. Review GitHub Actions logs for errors
3. Check Vercel deployment logs
4. Open an issue using the Production Issue template

## Environment URLs

After deployment, your application will be available at:

- **Production**: `https://your-project.vercel.app`
- **Preview** (PR branches): `https://your-project-git-[branch].vercel.app`

Replace `your-project` with your actual Vercel project name.

---

**Setup Time:** ~5 minutes  
**Complexity:** Low  
**Status:** Ready for Production

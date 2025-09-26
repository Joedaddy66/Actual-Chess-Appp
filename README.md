<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1IbnrCct74psfafRQMgTENZ66GoPJHYeh

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Build for Production

To build the application for production deployment:

```bash
# Build the application
npm run build

# Clean build (removes previous build artifacts)
npm run build:clean

# Build and preview locally
npm run preview:build
```

The build process will:
- Create optimized, minified production files in the `dist/` directory
- Generate separate chunks for vendor libraries and API dependencies
- Optimize assets for better caching and loading performance

Build artifacts:
- `dist/index.html` - Main HTML file
- `dist/assets/` - Optimized JavaScript and CSS files

# Railway Deployment Guide for PTO Connect

## ✅ Pre-Deployment Checklist

### What We've Done:
1. ✅ Cleaned up all Vercel-specific files and configurations
2. ✅ Removed all problematic build scripts
3. ✅ Created clean package.json with simple scripts
4. ✅ Created optimized vite.config.js
5. ✅ Added Railway configuration files (railway.json, nixpacks.toml)
6. ✅ Successfully tested local build

### Files Cleaned Up:
- All vite.config.*.js variants (removed)
- All scripts/fix-*.js files (removed)
- vercel.json (removed)
- .babelrc (removed)
- webpack.config.js (removed)
- All VERCEL*.md documentation (removed)

## 🚀 Deployment Steps

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "Clean up for Railway deployment - remove Vercel artifacts"
git push origin main
```

### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `mechprone/pto-connect`
5. Select the `main` branch

### Step 3: Configure Environment Variables
In Railway dashboard, add these environment variables:
```
NODE_ENV=production
VITE_SUPABASE_URL=https://xvnfynjnxvmcxhfguqmj.supabase.co
VITE_SUPABASE_ANON_KEY=[your anon key]
VITE_API_URL=https://api.ptoconnect.com
```

### Step 4: Deploy
Railway will automatically:
1. Detect the Nixpacks configuration
2. Install dependencies with `npm install --legacy-peer-deps`
3. Build with `npm run build`
4. Serve the dist folder on port 3000

### Step 5: Configure Custom Domain
1. In Railway project settings, go to "Domains"
2. Add custom domain: `app.ptoconnect.com`
3. Update DNS records:
   - Type: CNAME
   - Name: app
   - Value: [Railway provides this]

## 📁 Project Structure

```
pto-connect/
├── src/                    # React source code
├── dist/                   # Build output (gitignored)
├── package.json           # Clean dependencies
├── vite.config.js         # Simple Vite config
├── railway.json           # Railway configuration
├── nixpacks.toml          # Build configuration
└── [other app files]
```

## 🔧 Configuration Files

### railway.json
- Specifies Nixpacks builder
- Sets build and start commands
- Configures restart policy

### nixpacks.toml
- Uses Node.js 18.x
- Installs with --legacy-peer-deps
- Serves dist folder with `serve`

### vite.config.js
- Standard React plugin
- Optimized chunk splitting
- Source maps enabled

## 🎯 Expected Result

After deployment:
1. App available at Railway-provided URL
2. Custom domain working at app.ptoconnect.com
3. Fast loading with optimized chunks
4. All features working as expected

## 🐛 Troubleshooting

If build fails:
1. Check Railway build logs
2. Verify all environment variables are set
3. Ensure GitHub repo is up to date

If app doesn't load:
1. Check browser console for errors
2. Verify API URL is correct
3. Check Supabase connection

## 📊 Performance

With Railway, you get:
- Faster builds (no module resolution issues)
- Better performance (optimized serving)
- Easier debugging (clear logs)
- Scalability (auto-scaling available)

## 🎉 Success Indicators

You'll know it's working when:
1. Build completes in under 2 minutes
2. No module resolution errors
3. App loads at custom domain
4. Login works with test credentials
5. All features functional

## 📝 Notes

- Railway uses Nixpacks by default (better than Vercel's build system)
- The serve package handles SPA routing correctly
- No need for complex build scripts or workarounds
- Clean, maintainable configuration

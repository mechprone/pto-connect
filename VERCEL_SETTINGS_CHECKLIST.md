# Vercel Settings Checklist

## Critical Settings to Check in Vercel Dashboard

### 1. **Build & Development Settings**
Navigate to: Project Settings → General → Build & Development Settings

Check these fields:
- **Framework Preset**: Should be `Vite` or `Other`
- **Build Command**: Should match our vercel.json (`npm run build`)
- **Output Directory**: Should be `dist`
- **Install Command**: Should be `npm install --legacy-peer-deps`
- **Development Command**: Leave empty
- **Node.js Version**: Should be `18.x` (matching our .nvmrc)

⚠️ **IMPORTANT**: If any of these are set in the dashboard, they OVERRIDE vercel.json!

### 2. **Root Directory**
Navigate to: Project Settings → General → Root Directory

- Should be empty or `.` (not set to a subdirectory)
- If set to something like `pto-connect/`, it would cause issues

### 3. **Environment Variables**
Navigate to: Project Settings → Environment Variables

Check for:
- `NODE_ENV` - Should NOT be set (Vercel sets it automatically)
- `NPM_CONFIG_LEGACY_PEER_DEPS` - If set, should be `true`
- Any custom build-related variables

### 4. **Functions**
Navigate to: Project Settings → Functions

- **Functions Region**: Doesn't affect build but note the region
- Make sure no custom functions are configured that might interfere

### 5. **Git Settings**
Navigate to: Project Settings → Git

- **Production Branch**: Should be `main`
- **Ignored Build Step**: Should be empty (not ignoring builds)

## How to Reset Settings

If you find any overrides:

1. **Clear all Build & Development Settings**:
   - Set Framework Preset to `Other`
   - Clear all command fields (leave them empty)
   - This forces Vercel to use vercel.json

2. **Or explicitly set them**:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install --legacy-peer-deps
   Node.js Version: 18.x
   ```

## Additional Checks

### Build Cache
- Try clicking "Redeploy" → "Redeploy with existing Build Cache cleared"
- This ensures no corrupted cache is causing issues

### Deployment Protection
- Ensure "Vercel Authentication" or "Password Protection" isn't interfering

### Project Type
- Verify the project isn't set as a "Serverless Function" project

## Quick Test

After checking/updating settings:
1. Make a small change (like adding a comment to package.json)
2. Commit and push
3. Watch the build logs to confirm your settings are being used

## If Still Failing

If the build still fails after verifying all settings:
1. Try creating a new Vercel project from scratch
2. Import the same GitHub repo
3. Let Vercel auto-detect settings (it should read vercel.json)

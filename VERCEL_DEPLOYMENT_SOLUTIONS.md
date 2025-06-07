# Vercel Deployment Solutions for PTO Connect

## Problem Summary
The React/Vite application builds perfectly locally but fails on Vercel with the error:
```
Could not resolve "./cjs/react-jsx-runtime.production.min.js"
```

## Solutions Implemented

### Solution 1: Enhanced Vite Configuration (Primary)
I've updated the main `vite.config.js` with:
- Explicit React alias paths to force ESM module resolution
- ESM-specific build configuration
- Proper JSX runtime configuration
- Module resolution optimizations

### Solution 2: Custom Build Script
Created `scripts/vercel-build.js` that:
- Checks for React JSX runtime files
- Creates ESM wrappers if needed
- Provides detailed logging for debugging
- Handles the build process with proper environment variables

To use this solution:
1. The `vercel.json` is already configured to use `npm run build:vercel`
2. This will run the custom build script

### Solution 3: Prebuild Script
Created `scripts/prebuild.js` that:
- Ensures jsx-runtime.js files exist before build
- Creates proper module exports
- Runs automatically with `npm run build`

### Solution 4: Classic JSX Transform (Fallback)
Created `vite.config.simple.js` that uses the classic JSX transform to completely bypass the jsx-runtime issue.

To use this as a fallback:
1. Rename `vite.config.js` to `vite.config.backup.js`
2. Rename `vite.config.simple.js` to `vite.config.js`
3. Add React imports to all component files (see below)

## Deployment Steps

### Try Solution 1 First (Recommended):
1. Commit and push all changes
2. Clear Vercel build cache (in Vercel dashboard → Settings → Clear Cache)
3. Trigger a new deployment
4. Monitor the build logs

### If Solution 1 Fails, Try Solution 2:
The custom build script is already configured in `vercel.json`. It will:
- Provide detailed debugging information
- Show exactly what files exist/don't exist
- Attempt to fix the issue during build

### If Both Fail, Try Solution 4 (Classic JSX):
1. Use the simple vite config
2. Update your React components to include explicit React imports:

```javascript
// Add this to the top of every .jsx file
import React from 'react';
```

You can do this quickly with a script:
```bash
# Run this in the pto-connect directory
find ./src -name "*.jsx" -type f -exec sed -i '1s/^/import React from '\''react'\'';\n/' {} \;
```

## Additional Configuration Files Created

1. **jsconfig.json** - Helps with module resolution
2. **.babelrc** - Explicit Babel configuration for JSX transform
3. **Updated package.json** - Added necessary dependencies and scripts
4. **Updated vercel.json** - Enhanced build configuration

## Environment Variables Set
- `NODE_ENV=production`
- `NODE_OPTIONS=--max-old-space-size=4096`
- `VITE_CJS_IGNORE_WARNING=true`

## What These Solutions Address

1. **Module Resolution**: Forces Vercel to use ESM modules instead of CJS
2. **JSX Runtime**: Ensures the jsx-runtime is available and properly configured
3. **Build Environment**: Provides consistent build environment between local and Vercel
4. **Fallback Option**: Classic JSX transform completely avoids the jsx-runtime issue

## Testing Locally

To test if the build will work on Vercel:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Test production build
npm run build

# Test with custom script
npm run build:vercel
```

## Next Steps

1. Try deploying with the current configuration
2. Check Vercel build logs for any new errors
3. If it still fails, the build logs from the custom script will provide more information
4. Use the classic JSX transform as a last resort

## Important Notes

- All dependencies have been moved to `dependencies` (not `devDependencies`)
- Node.js version is set to 18 via `.nvmrc`
- The build uses `--legacy-peer-deps` to avoid peer dependency conflicts
- Multiple module resolution strategies are in place

The comprehensive approach should resolve the JSX runtime issue. If none of these solutions work, the problem might be specific to your Vercel project configuration, and you may need to create a fresh Vercel project.

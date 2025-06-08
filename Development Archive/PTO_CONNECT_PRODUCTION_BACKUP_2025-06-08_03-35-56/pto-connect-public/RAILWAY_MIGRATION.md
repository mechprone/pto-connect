# Railway Migration for PTO Connect Public Site

## Overview
The public marketing site (ptoconnect.com) should also move to Railway for consistency and better management.

## Current Structure
- Location: `/pto-connect-public`
- Simple Vite + React site
- Marketing pages, pricing, signup flow

## Migration Steps

### 1. Clean Up Configuration
Similar to main app:
- Remove any Vercel-specific configs
- Ensure clean package.json
- Simple vite.config.js

### 2. Add Railway Configuration

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "npx serve dist -s -l 3000",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create `nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npx serve dist -s -l 3000"
```

### 3. Deploy to Railway
1. Create new Railway project for public site
2. Connect to same GitHub repo
3. Set root directory to `/pto-connect-public`
4. Configure domains:
   - ptoconnect.com
   - www.ptoconnect.com

### 4. Environment Variables
```
NODE_ENV=production
VITE_API_URL=https://api.ptoconnect.com
VITE_STRIPE_PUBLISHABLE_KEY=[your key]
```

## Benefits of Consolidation
- Single platform for all services
- Unified billing
- Consistent deployment process
- Better performance (same infrastructure)
- Easier management

## Timeline
1. Week 1: Deploy main app
2. Week 1-2: Deploy public site
3. Week 2: Migrate backend from Render
4. Week 3: Optimize and monitor

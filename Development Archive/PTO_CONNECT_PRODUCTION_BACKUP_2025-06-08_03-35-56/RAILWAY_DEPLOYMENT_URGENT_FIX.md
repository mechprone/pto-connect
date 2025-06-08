# 🚨 URGENT: Railway Deployment Fix for PTO Connect

**Issue Identified:** Node.js version mismatch and Rollup native module error  
**Priority:** CRITICAL  
**Estimated Fix Time:** 30-60 minutes  

---

## 🔍 Root Cause Analysis

Based on the build log, there are two critical issues:

### Issue 1: Node.js Version Mismatch
```
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'react-router@7.6.2',
npm warn EBADENGINE   required: { node: '>=20.0.0' },
npm warn EBADENGINE   current: { node: 'v18.20.5', npm: '10.8.2' }
```

### Issue 2: Rollup Native Module Error
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu. npm has a bug related to optional dependencies
```

---

## 🛠️ IMMEDIATE FIX PLAN

### **Step 1: Force Node.js 20 in Railway (5 minutes)**

#### Option A: Update nixpacks.toml
Update `pto-connect/nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ['nodejs_20', 'npm']

[phases.install]
cmds = ['npm ci --include=optional']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npx serve dist -s -l 10000'
```

#### Option B: Add .nvmrc file
Create `pto-connect/.nvmrc`:
```
20.11.0
```

### **Step 2: Fix Package Lock and Dependencies (10 minutes)**

#### Update package.json engines
Add to `pto-connect/package.json`:
```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

#### Clean install approach - Update railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "rm -rf node_modules package-lock.json && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npx serve dist -s -l 10000",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **Step 3: Alternative Rollup Fix (if needed)**

If the above doesn't work, downgrade Vite temporarily:
```json
// In package.json, change:
"vite": "^5.4.2"
// To:
"vite": "^4.5.0"
```

---

## 🚀 IMPLEMENTATION STEPS

### **Immediate Actions (Next 30 minutes)**

1. **Update nixpacks.toml**
2. **Add .nvmrc file** 
3. **Update package.json engines**
4. **Commit and push changes**
5. **Trigger Railway redeploy**
6. **Monitor build logs**

### **If First Attempt Fails**

1. **Try alternative railway.json with clean install**
2. **Downgrade Vite if necessary**
3. **Use Docker approach as fallback**

---

## 📋 EXACT FILES TO UPDATE

### File 1: `pto-connect/nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ['nodejs_20', 'npm']

[phases.install]
cmds = ['npm ci --include=optional']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npx serve dist -s -l 10000'
```

### File 2: `pto-connect/.nvmrc`
```
20.11.0
```

### File 3: `pto-connect/package.json` (add engines section)
```json
{
  "name": "pto-connect-frontend",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
  // ... rest of existing content
}
```

### File 4: `pto-connect/railway.json` (updated)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "rm -rf node_modules package-lock.json && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npx serve dist -s -l 10000",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🔄 DEPLOYMENT SEQUENCE

1. **Make file changes** (above)
2. **Commit to git**:
   ```bash
   git add .
   git commit -m "Fix Railway deployment: Node 20 + clean install"
   git push origin main
   ```
3. **Monitor Railway build logs**
4. **Test Railway URL once build completes**
5. **Verify custom domain works**

---

## 🛡️ FALLBACK PLAN

If Nixpacks continues to fail, switch to Docker:

### Create `pto-connect/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --include=optional
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Create `pto-connect/nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### Update `pto-connect/railway.json` for Docker:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  }
}
```

---

## ✅ SUCCESS CRITERIA

- [ ] Build completes without Node.js version warnings
- [ ] Build completes without Rollup module errors
- [ ] Railway URL serves the application
- [ ] Login page loads correctly
- [ ] No console errors in browser

---

## ⏱️ TIMELINE

- **0-15 min**: Make file changes and commit
- **15-30 min**: Monitor Railway build and deployment
- **30-45 min**: Test and verify functionality
- **45-60 min**: Implement fallback if needed

---

**NEXT ACTION**: Implement the file changes above immediately to resolve the deployment issue.

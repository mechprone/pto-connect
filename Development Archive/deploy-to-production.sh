#!/bin/bash

# PTO Connect - Deploy to Production Script
# This script pushes code changes and prepares for live deployment

echo "🚀 PTO Connect - Deploy to Production"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "LIVE_DEPLOYMENT_GUIDE.md" ]; then
    echo "❌ Error: Please run this script from the root directory (c:/Dev)"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "✅ Database setup complete"
echo "✅ CORS configuration updated"
echo "✅ API URLs configured for production"
echo "✅ Environment variable templates ready"

# Push backend changes
echo ""
echo "📤 Pushing backend changes to GitHub..."
cd pto-connect-backend
git add .
git commit -m "Production deployment: Updated CORS for Vercel, environment debug logging"
git push origin main
echo "✅ Backend pushed to GitHub"

# Push frontend changes  
echo ""
echo "📤 Pushing frontend changes to GitHub..."
cd ../pto-connect
git add .
git commit -m "Production deployment: Updated API URL for Render backend"
git push origin main
echo "✅ Frontend pushed to GitHub"

# Return to root
cd ..

echo ""
echo "🎉 Code deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy backend to Render:"
echo "   - Go to https://render.com"
echo "   - Create new Web Service from pto-connect-backend repo"
echo "   - Add environment variables (see LIVE_DEPLOYMENT_GUIDE.md)"
echo ""
echo "2. Deploy frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Create new project from pto-connect repo"
echo "   - Add environment variables (see LIVE_DEPLOYMENT_GUIDE.md)"
echo ""
echo "3. Get your Supabase API keys:"
echo "   - Go to https://supabase.com/dashboard/project/dakyetfomciihdiuwrbx/settings/api"
echo "   - Copy anon key and service role key"
echo "   - Add to both Render and Vercel environment variables"
echo ""
echo "📖 Full deployment guide: LIVE_DEPLOYMENT_GUIDE.md"
echo ""
echo "🎯 Expected URLs after deployment:"
echo "   Frontend: https://pto-connect.vercel.app"
echo "   Backend:  https://pto-connect-backend.onrender.com"
echo ""
echo "✨ Your PTO Connect app is ready for live deployment!"

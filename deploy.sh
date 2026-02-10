#!/bin/bash

echo "🚀 CaptionFlow Deployment Script"
echo "================================"
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
echo ""
echo "Step 1: Logging into Vercel..."
vercel login

# Navigate to project
cd "$(dirname "$0")"

# Deploy
echo ""
echo "Step 2: Deploying to Vercel..."
echo ""
echo "When prompted:"
echo "- Set up and deploy? [Y/n] → Y"
echo "- Which scope? → Select your account"
echo "- Link to existing project? [y/N] → N"
echo "- What's your project name? → captionflow"
echo "- In which directory is your code located? → ./"
echo ""

vercel --prod

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel Dashboard → Project Settings → Environment Variables"
echo "2. Add all environment variables from your .env.local file"
echo "3. Redeploy if needed"
echo "4. Configure custom domain: cf.pawelrzepecki.com"
echo ""
echo "📖 Full guide: DEPLOYMENT.md"

#!/bin/bash

# 🚀 TON Shield TMA - Quick Start Script

echo "🛡️  TON Shield Telegram Mini App"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the ton-shield-tma directory"
    exit 1
fi

echo "✅ Project directory verified"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "Creating default .env.local..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_TON_MANIFEST_URL=https://yourapp.com/tonconnect-manifest.json
EOF
    echo "✅ Created .env.local with default values"
else
    echo "✅ .env.local exists"
fi
echo ""

echo "🎯 Next Steps:"
echo ""
echo "1. Make sure backend API is running:"
echo "   cd '/Users/apple/VS projects/Ton Shield'"
echo "   npm run dev"
echo ""
echo "2. Start the frontend (this project):"
echo "   npm run dev"
echo ""
echo "3. Open in browser:"
echo "   http://localhost:3000"
echo ""
echo "📱 For Telegram testing:"
echo "   - Install ngrok: brew install ngrok"
echo "   - Run: ngrok http 3000"
echo "   - Create bot with @BotFather"
echo "   - Set Web App URL to ngrok URL"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - QUICKSTART.md - Detailed setup guide"
echo "   - PROJECT_SUMMARY.md - Complete feature list"
echo ""
echo "🎉 Ready to start development!"

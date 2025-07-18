#!/bin/bash

echo "🔧 KOL Tracker Pro - Local Development Fix Script"
echo "================================================="

# Kill all running processes
echo "🛑 Stopping all running services..."
pkill -f "npm run start:dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "python3 main.py" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Kill processes on specific ports
echo "🛑 Freeing up ports..."
lsof -ti:3000,8000,5173,5174,5175,5176,5177 | xargs kill -9 2>/dev/null || true

# Fix Telegram database lock issues
echo "🔧 Fixing Telegram database lock issues..."
cd backend/telethon_service
chmod 666 telegram_session.session* 2>/dev/null || true
rm -f telegram_session.session-journal 2>/dev/null || true
rm -f telethon.pid 2>/dev/null || true

# Clean up any locked database files
if [ -f "telegram_session.session" ]; then
    echo "📁 Backing up existing session..."
    cp telegram_session.session telegram_session.session.backup
    echo "🔓 Unlocking database..."
    sqlite3 telegram_session.session "PRAGMA journal_mode=DELETE;" 2>/dev/null || true
    sqlite3 telegram_session.session "VACUUM;" 2>/dev/null || true
fi

# Set proper permissions
chmod 644 telegram_session.session* 2>/dev/null || true

# Fix Git merge conflicts in files
echo "🔧 Fixing Git merge conflicts..."
cd /Users/theepak/Downloads/kol-tracker-pro-main

# Fix index.css
if grep -q "<<<<<<< HEAD" src/index.css; then
    echo "🔧 Fixing index.css merge conflicts..."
    # Remove merge conflict markers and keep the content
    sed -i '' '/<<<<<<< HEAD/d; /=======/d; />>>>>>> /d' src/index.css
fi

# Fix component files with merge conflicts
for file in src/components/*.tsx; do
    if [ -f "$file" ] && grep -q "<<<<<<< HEAD" "$file"; then
        echo "🔧 Fixing merge conflicts in $file..."
        sed -i '' '/<<<<<<< HEAD/d; /=======/d; />>>>>>> /d' "$file"
    fi
done

# Fix Tailwind CSS issues
echo "🎨 Fixing Tailwind CSS issues..."
# Replace problematic opacity classes
find src -name "*.tsx" -type f -exec sed -i '' 's/hover:border-primary\/50/hover:border-primary hover:border-opacity-50/g' {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/focus:ring-primary\/50/focus:ring-primary focus:ring-opacity-50/g' {} \;
find src -name "*.css" -type f -exec sed -i '' 's/hover:border-primary\/50/hover:border-primary hover:border-opacity-50/g' {} \;
find src -name "*.css" -type f -exec sed -i '' 's/focus:ring-primary\/50/focus:ring-primary focus:ring-opacity-50/g' {} \;

# Fix @apply group utility issues
if grep -q "@apply.*group" src/index.css; then
    echo "🔧 Fixing @apply group utility issues..."
    sed -i '' 's/@apply card group hover:bg-gradient-to-br hover:from-card hover:to-card-hover/@apply card hover:bg-gradient-to-br hover:from-card hover:to-card-hover/g' src/index.css
fi

# Set up environment variables
echo "🔧 Setting up environment variables..."
export NODE_ENV=development
export PORT=3000
export MONGODB_URI="mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority"
export MONGODB_DB=kol-tracker-pro
export JWT_SECRET=5c3b577c95b24f768d746a31229d79e0a5be87183c92e4bf504c4d88e2ae5957a90aa61e6900fd7425f739e3c5f44f5b84fa3554cadbccefb95e2223736669f8
export API_ID=28152923
export API_HASH=766760d2838474a5e6dd734d785aa7ad
export SESSION_NAME=telegram_session
export VITE_API_URL=http://localhost:3000/api
export VITE_TELETHON_URL=http://localhost:8000

# Create .env files
echo "📝 Creating .env files..."

# Backend .env
cat > backend/.env << EOF
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
MONGODB_DB=kol-tracker-pro
JWT_SECRET=5c3b577c95b24f768d746a31229d79e0a5be87183c92e4bf504c4d88e2ae5957a90aa61e6900fd7425f739e3c5f44f5b84fa3554cadbccefb95e2223736669f8
EOF

# Telethon .env
cat > backend/telethon_service/.env << EOF
API_ID=28152923
API_HASH=766760d2838474a5e6dd734d785aa7ad
SESSION_NAME=telegram_session
MONGODB_URI=mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
MONGODB_DB=kol-tracker-pro
PORT=8000
EOF

# Frontend .env
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
VITE_TELETHON_URL=http://localhost:8000
EOF

echo "✅ Local development environment fixed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your MongoDB Atlas dashboard"
echo "2. Click 'Connect' on your cluster"
echo "3. Copy the EXACT connection string"
echo "4. Add your current IP address to the whitelist"
echo "5. Run the Telegram auth setup: cd backend/telethon_service && python3 auth_setup.py"
echo ""
echo "🚀 To start the services:"
echo "Backend: cd backend && npm run start:dev"
echo "Telethon: cd backend/telethon_service && python3 main.py"
echo "Frontend: npm run dev" 
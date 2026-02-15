#!/bin/bash
# SRA System - Complete Startup Script
# Run all services needed for the application

echo "================================================"
echo "Smart Reconciliation & Audit (SRA) System"
echo "Complete Startup Script"
echo "================================================"

# Check Node.js
if ! command -v node &> /dev/null
then
    echo "ERROR: Node.js is not installed"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check MongoDB
if ! command -v mongod &> /dev/null
then
    echo "WARNING: MongoDB CLI not found. Ensure MongoDB daemon is running:"
    echo "  mongod"
fi

echo ""
echo "Step 1: Installing backend dependencies..."
cd backend
npm install 2>&1 | tail -1

echo ""
echo "Step 2: Installing frontend dependencies..."
cd ../frontend
npm install 2>&1 | tail -1

echo ""
echo "Step 3: Seeding database with test users..."
cd ../backend
node scripts/seed.js

echo ""
echo "================================================"
echo "READY TO START!"
echo "================================================"
echo ""
echo "Open TWO new terminals and run:"
echo ""
echo "Terminal 1 - Backend (Port 5000):"
echo "  cd backend && npm start"
echo ""
echo "Terminal 2 - Frontend (Port 5173):"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "Test Account:"
echo "  Email: admin@example.com"
echo "  Password: Admin123!"
echo ""
echo "================================================"

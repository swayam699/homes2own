#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "============================================="
echo "  CRAVECART - PRODUCTION BUILD ON RENDER     "
echo "============================================="

# 1. Install Backend Dependencies
echo "--> Installing Backend Dependencies..."
cd backend
npm install
cd ..

# 2. Install Frontend Dependencies
echo "--> Installing Frontend Dependencies..."
cd frontend
npm install

# 3. Build Frontend Production Bundle
echo "--> Compiling Frontend Production Bundle with Vite..."
npm run build
cd ..

echo "============================================="
echo "  BUILD COMPLETE: Application Ready to Start  "
echo "============================================="

#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "============================================="
echo "  CRAVECART - PRODUCTION BUILD ON RENDER     "
echo "============================================="

# Ensure npm installs all build dependencies
export NPM_CONFIG_PRODUCTION=false

# 1. Install Backend Dependencies
echo "--> Installing Backend Dependencies..."
cd backend
npm install --include=dev
cd ..

# 2. Install Frontend Dependencies (including vite & tailwind)
echo "--> Installing Frontend Dependencies..."
cd frontend
npm install --include=dev

# 3. Build Frontend Production Bundle
echo "--> Compiling Frontend Production Bundle with Vite..."
npm run build
cd ..

echo "============================================="
echo "  BUILD COMPLETE: Application Ready to Start  "
echo "============================================="

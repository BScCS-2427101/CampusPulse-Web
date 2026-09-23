#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend..."
npm run build
cd ..

echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Build complete."

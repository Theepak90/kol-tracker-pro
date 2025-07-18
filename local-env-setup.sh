#!/bin/bash

# KOL Tracker Pro - Local Environment Setup
echo "Setting up local environment variables..."

# Backend Environment Variables
export NODE_ENV=development
export PORT=3000
export MONGODB_URI=mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
export MONGODB_DB=kol-tracker-pro
export JWT_SECRET=5c3b577c95b24f768d746a31229d79e0a5be87183c92e4bf504c4d88e2ae5957a90aa61e6900fd7425f739e3c5f44f5b84fa3554cadbccefb95e2223736669f8

# Telethon Service Environment Variables
export API_ID=28152923
export API_HASH=766760d2838474a5e6dd734d785aa7ad
export SESSION_NAME=telegram_session

# Frontend Environment Variables
export VITE_API_URL=http://localhost:3000/api
export VITE_TELETHON_URL=http://localhost:8000

echo "Environment variables set successfully!"
echo "MongoDB URI: $MONGODB_URI"
echo "Backend will run on: http://localhost:3000"
echo "Telethon service will run on: http://localhost:8000"
echo "Frontend will run on: http://localhost:5173" 
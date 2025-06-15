#!/bin/bash

# Test Deployment Locally Script
# This simulates the App Runner build process locally to catch issues early

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing FixFox Deployment Locally${NC}"
echo "====================================="
echo ""

# Clean up any previous test
echo -e "${YELLOW}🧹 Cleaning up previous test...${NC}"
rm -rf test-deployment
rm -rf dist

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci

echo -e "${YELLOW}🏗️  Building application...${NC}"
NX_CLOUD_DISTRIBUTED_EXECUTION=false npx nx build rest-man-server --skip-nx-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Preparing deployment folder...${NC}"
mkdir -p test-deployment
cp -r dist/apps/rest-man-server/* test-deployment/
cp deployment-package.json test-deployment/package.json

echo -e "${YELLOW}📦 Installing production dependencies...${NC}"
cd test-deployment
npm ci --production

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Production dependency installation failed!${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Checking deployment structure...${NC}"
echo "Files in deployment folder:"
ls -la

echo ""
echo -e "${YELLOW}📄 Checking main.js exists...${NC}"
if [ -f "main.js" ]; then
    echo -e "${GREEN}✅ main.js found${NC}"
else
    echo -e "${RED}❌ main.js not found!${NC}"
    echo "Available files:"
    ls -la
    exit 1
fi

echo ""
echo -e "${YELLOW}🚀 Testing startup command...${NC}"
echo "Running: node main.js"

# Set required environment variables for testing
export NODE_ENV=production
export PORT=3001
export OPENAI_API_KEY=dummy-key-for-testing
export DB_HOST=fixfoxdb.cb8aywmkgppq.us-west-2.rds.amazonaws.com
export DB_PORT=5432
export DB_USERNAME=idanaim
export DB_PASSWORD=In16051982
export DB_DATABASE=fixfoxdb
export AWS_S3_BUCKET_NAME=fixfox-files
export AWS_REGION=us-west-2

# Start the application in background
timeout 10s node main.js &
APP_PID=$!

# Wait a moment for startup
sleep 3

# Test if the application is responding
echo -e "${YELLOW}🏥 Testing health endpoint...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")

# Kill the application
kill $APP_PID 2>/dev/null

if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed! (HTTP $response)${NC}"
    echo -e "${GREEN}🎉 Local deployment test successful!${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary:${NC}"
    echo "• Build: ✅ Success"
    echo "• Dependencies: ✅ Installed"
    echo "• Structure: ✅ Correct"
    echo "• Startup: ✅ Working"
    echo "• Health Check: ✅ Passed"
    echo ""
    echo -e "${GREEN}🚀 Ready for App Runner deployment!${NC}"
else
    echo -e "${RED}❌ Health check failed (HTTP $response)${NC}"
    echo -e "${RED}❌ Local deployment test failed!${NC}"
    exit 1
fi

# Clean up
cd ..
rm -rf test-deployment

echo ""
echo -e "${BLUE}💡 Next steps:${NC}"
echo "1. Commit your changes: git add . && git commit -m 'Fix App Runner deployment'"
echo "2. Push to trigger deployment: git push origin main"
echo "3. Monitor deployment in App Runner console" 
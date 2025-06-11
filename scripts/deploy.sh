#!/bin/bash

# FixFox REST API Deployment Script
set -e

echo "🚀 Starting FixFox REST API Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="fixfox-api"
ENV_NAME="fixfox-api-prod"
REGION="us-west-2"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}❌ AWS CLI not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured${NC}"

# Check if EB CLI is available
if ! command -v eb &> /dev/null; then
    echo -e "${RED}❌ EB CLI not found. Installing...${NC}"
    pip3 install awsebcli
fi

echo -e "${GREEN}✅ EB CLI available${NC}"

# Build the application
echo -e "${YELLOW}📦 Building application...${NC}"
cd apps/rest-man-server
npm install
npm run build

# Initialize EB if not already done
if [ ! -f .elasticbeanstalk/config.yml ]; then
    echo -e "${YELLOW}🔧 Initializing Elastic Beanstalk...${NC}"
    eb init $APP_NAME --region $REGION --platform "Node.js 18 running on 64bit Amazon Linux 2023"
fi

# Create environment if it doesn't exist
if ! eb status $ENV_NAME > /dev/null 2>&1; then
    echo -e "${YELLOW}🌍 Creating environment...${NC}"
    eb create $ENV_NAME --instance-type t3.micro --envvars NODE_ENV=production,PORT=8080
else
    echo -e "${GREEN}✅ Environment exists${NC}"
fi

# Deploy the application
echo -e "${YELLOW}🚀 Deploying to Elastic Beanstalk...${NC}"
eb deploy $ENV_NAME

# Get the application URL
URL=$(eb status $ENV_NAME | grep "CNAME" | awk '{print $2}')

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Application URL: http://$URL${NC}"
echo -e "${GREEN}📊 Health Check: http://$URL/api/health${NC}"

# Test the deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"
if curl -f -s "http://$URL/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed. Check the logs with: eb logs${NC}"
fi

echo -e "${GREEN}✨ Deployment script completed!${NC}" 
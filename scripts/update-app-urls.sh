#!/bin/bash

# FixFox App URLs Update Script
# Updates React Native app configuration with actual App Runner URLs

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔗 FixFox App URLs Update Script${NC}"
echo "=================================="
echo ""

REGION="us-west-2"
DEV_SERVICE="fixfox-api-dev"
PROD_SERVICE="fixfox-api-prod"
CONFIG_FILE="apps/rest-man-native/src/config/environment.ts"

# Function to get service URL
get_service_url() {
    local service_name=$1
    local service_arn=$(aws apprunner list-services \
        --region $REGION \
        --query "ServiceSummaryList[?ServiceName=='$service_name'].ServiceArn" \
        --output text 2>/dev/null)
    
    if [ -z "$service_arn" ] || [ "$service_arn" = "None" ]; then
        echo ""
        return 1
    fi
    
    local service_url=$(aws apprunner describe-service \
        --service-arn "$service_arn" \
        --region $REGION \
        --query 'Service.ServiceUrl' \
        --output text 2>/dev/null)
    
    if [ "$service_url" = "null" ] || [ -z "$service_url" ]; then
        echo ""
        return 1
    fi
    
    echo "https://$service_url"
    return 0
}

echo "🔍 Getting App Runner service URLs..."

# Get development URL
echo "📱 Checking development service..."
DEV_URL=$(get_service_url $DEV_SERVICE)
if [ $? -eq 0 ] && [ ! -z "$DEV_URL" ]; then
    echo -e "${GREEN}✅ Development URL: $DEV_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Development service not found or not ready${NC}"
    DEV_URL="https://YOUR_DEV_APP_RUNNER_URL"
fi

# Get production URL
echo "🏭 Checking production service..."
PROD_URL=$(get_service_url $PROD_SERVICE)
if [ $? -eq 0 ] && [ ! -z "$PROD_URL" ]; then
    echo -e "${GREEN}✅ Production URL: $PROD_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Production service not found or not ready${NC}"
    PROD_URL="https://YOUR_PROD_APP_RUNNER_URL"
fi

echo ""
echo "📝 Updating configuration file..."

# Create backup
cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
echo -e "${BLUE}💾 Backup created: $CONFIG_FILE.backup${NC}"

# Update the configuration file
sed -i.tmp "s|API_BASE_URL: 'https://YOUR_DEV_APP_RUNNER_URL/api'|API_BASE_URL: '$DEV_URL/api'|g" "$CONFIG_FILE"
sed -i.tmp "s|API_BASE_URL: 'https://YOUR_PROD_APP_RUNNER_URL/api'|API_BASE_URL: '$PROD_URL/api'|g" "$CONFIG_FILE"

# Clean up temporary file
rm -f "$CONFIG_FILE.tmp"

echo -e "${GREEN}✅ Configuration updated!${NC}"
echo ""

echo -e "${BLUE}📊 Current Configuration:${NC}"
echo "• Development API: $DEV_URL/api"
echo "• Production API: $PROD_URL/api"
echo ""

echo -e "${BLUE}🧪 Testing endpoints...${NC}"

# Test development endpoint
if [ "$DEV_URL" != "https://YOUR_DEV_APP_RUNNER_URL" ]; then
    echo "Testing development health check..."
    if curl -s -f "$DEV_URL/api/health" > /dev/null; then
        echo -e "${GREEN}✅ Development API is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  Development API health check failed${NC}"
    fi
fi

# Test production endpoint
if [ "$PROD_URL" != "https://YOUR_PROD_APP_RUNNER_URL" ]; then
    echo "Testing production health check..."
    if curl -s -f "$PROD_URL/api/health" > /dev/null; then
        echo -e "${GREEN}✅ Production API is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  Production API health check failed${NC}"
    fi
fi

echo ""
echo -e "${BLUE}📱 Next Steps:${NC}"
echo "1. Test your React Native app in development mode"
echo "2. Build staging version: eas build --profile staging"
echo "3. Build production version: eas build --profile production"
echo ""

echo -e "${GREEN}🎉 App URLs updated successfully!${NC}" 
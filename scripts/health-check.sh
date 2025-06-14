#!/bin/bash

# FixFox Health Check Script
# Quick health check for the deployed API

SERVICE_NAME="fixfox-api"
REGION="us-west-2"
RETRIES=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏥 FixFox API Health Check${NC}"
echo "=========================="
echo ""

# Get service URL
echo "🔍 Getting service information..."
SERVICE_ARN=$(aws apprunner list-services \
    --region $REGION \
    --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" \
    --output text 2>/dev/null)

if [ -z "$SERVICE_ARN" ] || [ "$SERVICE_ARN" = "None" ]; then
    echo -e "${RED}❌ App Runner service '$SERVICE_NAME' not found.${NC}"
    exit 1
fi

SERVICE_INFO=$(aws apprunner describe-service \
    --service-arn "$SERVICE_ARN" \
    --region $REGION \
    --query 'Service.{Status:Status,ServiceUrl:ServiceUrl}' \
    --output json 2>/dev/null)

SERVICE_STATUS=$(echo "$SERVICE_INFO" | jq -r '.Status')
SERVICE_URL=$(echo "$SERVICE_INFO" | jq -r '.ServiceUrl')

echo -e "${BLUE}Service Status:${NC} $SERVICE_STATUS"

if [ "$SERVICE_URL" = "null" ] || [ -z "$SERVICE_URL" ]; then
    echo -e "${YELLOW}⏳ Service URL not available${NC}"
    exit 1
fi

echo -e "${BLUE}Service URL:${NC} https://$SERVICE_URL"
echo -e "${BLUE}Health Endpoint:${NC} https://$SERVICE_URL/api/health"
echo ""

if [ "$SERVICE_STATUS" != "RUNNING" ]; then
    echo -e "${YELLOW}⚠️  Service is not running (Status: $SERVICE_STATUS)${NC}"
    echo "Cannot perform health check"
    exit 1
fi

# Perform health checks
echo -e "${BLUE}🏥 Performing health check...${NC}"

for i in $(seq 1 $RETRIES); do
    echo "Attempt $i/$RETRIES..."
    
    # Perform health check with timeout
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$SERVICE_URL/api/health" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Health check passed! (HTTP $response)${NC}"
        
        # Get detailed health info
        echo ""
        echo -e "${BLUE}📊 Health Details:${NC}"
        health_data=$(curl -s --max-time 10 "https://$SERVICE_URL/api/health" 2>/dev/null || echo "Failed to get health data")
        echo "$health_data" | jq . 2>/dev/null || echo "$health_data"
        
        echo ""
        echo -e "${GREEN}🎉 API is healthy and responding!${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Health check attempt $i failed (HTTP $response)${NC}"
        if [ $i -lt $RETRIES ]; then
            echo "Retrying in 5 seconds..."
            sleep 5
        fi
    fi
done

echo -e "${RED}❌ All health check attempts failed${NC}"
echo "The API may be starting up or there might be an issue"
exit 1 
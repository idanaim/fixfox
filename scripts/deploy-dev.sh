#!/bin/bash

# FixFox Development Deployment Script
# This script deploys to AWS App Runner DEVELOPMENT and performs health checks

set -e  # Exit on any error

SERVICE_NAME="fixfox-api-dev"
REGION="us-west-2"
ENV="DEVELOPMENT"
MAX_WAIT_TIME=600  # 10 minutes max wait time
HEALTH_CHECK_RETRIES=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 FixFox DEVELOPMENT Deployment Script${NC}"
echo "========================================="
echo "Service: $SERVICE_NAME"
echo "Environment: $ENV"
echo "Region: $REGION"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo -e "${RED}❌ AWS CLI not configured or credentials invalid${NC}"
    echo "Please run: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials verified${NC}"

# Get service ARN
echo "🔍 Looking for DEVELOPMENT App Runner service..."
SERVICE_ARN=$(aws apprunner list-services \
    --region $REGION \
    --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" \
    --output text 2>/dev/null)

if [ -z "$SERVICE_ARN" ] || [ "$SERVICE_ARN" = "None" ]; then
    echo -e "${RED}❌ DEVELOPMENT App Runner service '$SERVICE_NAME' not found.${NC}"
    echo ""
    echo "To create the DEVELOPMENT service first:"
    echo "1. Run: ./scripts/setup-app-runner-dev.sh"
    echo "2. Or follow: scripts/app-runner-setup-guide.md"
    exit 1
fi

echo -e "${GREEN}✅ DEVELOPMENT Service found${NC}"
echo "ARN: $SERVICE_ARN"
echo ""

# Start deployment
echo -e "${BLUE}🚀 Starting DEVELOPMENT deployment...${NC}"
DEPLOYMENT_ID=$(aws apprunner start-deployment \
    --service-arn "$SERVICE_ARN" \
    --region $REGION \
    --query 'OperationId' \
    --output text 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ DEVELOPMENT Deployment started successfully!${NC}"
    echo "Deployment ID: $DEPLOYMENT_ID"
else
    echo -e "${RED}❌ Failed to start DEVELOPMENT deployment${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⏳ Waiting for DEVELOPMENT deployment to complete...${NC}"
echo "This usually takes 3-5 minutes"
echo ""

# Wait for deployment to complete
WAIT_TIME=0
SLEEP_INTERVAL=15

while [ $WAIT_TIME -lt $MAX_WAIT_TIME ]; do
    # Get current status
    STATUS=$(aws apprunner describe-service \
        --service-arn "$SERVICE_ARN" \
        --region $REGION \
        --query 'Service.Status' \
        --output text 2>/dev/null)
    
    case $STATUS in
        "RUNNING")
            echo -e "${GREEN}🎉 DEVELOPMENT Deployment completed successfully!${NC}"
            break
            ;;
        "OPERATION_IN_PROGRESS")
            echo -e "${YELLOW}⏳ Still deploying... (${WAIT_TIME}s elapsed)${NC}"
            ;;
        "CREATE_FAILED"|"UPDATE_FAILED")
            echo -e "${RED}❌ DEVELOPMENT Deployment failed with status: $STATUS${NC}"
            echo "Check the App Runner console for detailed logs"
            exit 1
            ;;
        *)
            echo -e "${YELLOW}ℹ️  Current status: $STATUS (${WAIT_TIME}s elapsed)${NC}"
            ;;
    esac
    
    sleep $SLEEP_INTERVAL
    WAIT_TIME=$((WAIT_TIME + SLEEP_INTERVAL))
done

if [ $WAIT_TIME -ge $MAX_WAIT_TIME ]; then
    echo -e "${YELLOW}⚠️  DEVELOPMENT Deployment is taking longer than expected${NC}"
    echo "Check the App Runner console for status updates"
fi

echo ""
echo -e "${BLUE}📊 Getting DEVELOPMENT service information...${NC}"

# Get service URL and details
SERVICE_INFO=$(aws apprunner describe-service \
    --service-arn "$SERVICE_ARN" \
    --region $REGION \
    --query 'Service.{Status:Status,ServiceUrl:ServiceUrl}' \
    --output json 2>/dev/null)

SERVICE_STATUS=$(echo "$SERVICE_INFO" | jq -r '.Status')
SERVICE_URL=$(echo "$SERVICE_INFO" | jq -r '.ServiceUrl')

echo "Status: $SERVICE_STATUS"

if [ "$SERVICE_URL" = "null" ] || [ -z "$SERVICE_URL" ]; then
    echo -e "${YELLOW}⏳ Service URL not available yet${NC}"
    echo "The service may still be initializing"
else
    echo -e "${GREEN}🌐 DEVELOPMENT Service URL: https://$SERVICE_URL${NC}"
    echo -e "${BLUE}🏥 DEVELOPMENT Health Check URL: https://$SERVICE_URL/api/health${NC}"
    
    # Perform health checks if service is running
    if [ "$SERVICE_STATUS" = "RUNNING" ]; then
        echo ""
        echo -e "${BLUE}🏥 Performing DEVELOPMENT health checks...${NC}"
        
        for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
            echo "Attempt $i/$HEALTH_CHECK_RETRIES..."
            
            # Perform health check with timeout
            response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$SERVICE_URL/api/health" 2>/dev/null || echo "000")
            
            if [ "$response" = "200" ]; then
                echo -e "${GREEN}✅ DEVELOPMENT Health check passed! (HTTP $response)${NC}"
                
                # Get detailed health info
                echo ""
                echo -e "${BLUE}📊 DEVELOPMENT Health Details:${NC}"
                health_data=$(curl -s --max-time 10 "https://$SERVICE_URL/api/health" 2>/dev/null || echo "Failed to get health data")
                echo "$health_data" | jq . 2>/dev/null || echo "$health_data"
                break
            else
                echo -e "${YELLOW}⚠️  DEVELOPMENT Health check attempt $i failed (HTTP $response)${NC}"
                if [ $i -lt $HEALTH_CHECK_RETRIES ]; then
                    echo "Retrying in 10 seconds..."
                    sleep 10
                fi
            fi
        done
        
        if [ "$response" != "200" ]; then
            echo -e "${RED}❌ All DEVELOPMENT health check attempts failed${NC}"
            echo "The service may still be starting up or there might be an issue"
        fi
    else
        echo -e "${YELLOW}⏳ Skipping health check - service status: $SERVICE_STATUS${NC}"
    fi
fi

echo ""
echo -e "${BLUE}🔗 Useful Links:${NC}"
echo "• App Runner Console: https://console.aws.amazon.com/apprunner/"
echo "• CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home?region=$REGION#logsV2:log-groups"
if [ "$SERVICE_URL" != "null" ] && [ -n "$SERVICE_URL" ]; then
    echo "• DEVELOPMENT API Documentation: https://$SERVICE_URL/api/docs"
    echo "• DEVELOPMENT Health Check: https://$SERVICE_URL/api/health"
fi

echo ""
echo -e "${GREEN}🎉 DEVELOPMENT Deployment process completed!${NC}"
echo "Your FixFox DEVELOPMENT API is now live and auto-scaling!" 
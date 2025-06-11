#!/bin/bash

# FixFox App Runner Cost Management Script
# This script helps you pause/resume your App Runner service to save money

SERVICE_NAME="fixfox-api"
REGION="us-west-2"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🦊 FixFox App Runner Cost Manager${NC}"
echo "=================================="

# Function to check service status
check_status() {
    echo -e "${YELLOW}📊 Checking service status...${NC}"
    aws apprunner describe-service \
        --service-arn $(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" --output text --region $REGION) \
        --region $REGION \
        --query 'Service.Status' \
        --output text 2>/dev/null
}

# Function to pause service
pause_service() {
    echo -e "${YELLOW}⏸️  Pausing App Runner service...${NC}"
    SERVICE_ARN=$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" --output text --region $REGION)
    
    if [ -z "$SERVICE_ARN" ]; then
        echo -e "${RED}❌ Service '$SERVICE_NAME' not found${NC}"
        exit 1
    fi
    
    aws apprunner pause-service --service-arn $SERVICE_ARN --region $REGION
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Service paused successfully!${NC}"
        echo -e "${GREEN}💰 You're now saving money - no compute charges while paused${NC}"
    else
        echo -e "${RED}❌ Failed to pause service${NC}"
    fi
}

# Function to resume service
resume_service() {
    echo -e "${YELLOW}▶️  Resuming App Runner service...${NC}"
    SERVICE_ARN=$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" --output text --region $REGION)
    
    if [ -z "$SERVICE_ARN" ]; then
        echo -e "${RED}❌ Service '$SERVICE_NAME' not found${NC}"
        exit 1
    fi
    
    aws apprunner resume-service --service-arn $SERVICE_ARN --region $REGION
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Service resumed successfully!${NC}"
        echo -e "${BLUE}🌐 Your API will be available in 1-2 minutes${NC}"
    else
        echo -e "${RED}❌ Failed to resume service${NC}"
    fi
}

# Function to show cost estimate
show_costs() {
    echo -e "${BLUE}💰 Cost Breakdown (0.25 vCPU + 0.5 GB):${NC}"
    echo "  • Running 24/7: ~$5.04/month"
    echo "  • Running 8 hours/day: ~$1.68/month"
    echo "  • Running 4 hours/day: ~$0.84/month"
    echo "  • Paused: $0.00/month (only build minutes count)"
    echo ""
    echo -e "${GREEN}💡 Tip: Pause when not actively developing to save money!${NC}"
}

# Main menu
case "$1" in
    "status")
        STATUS=$(check_status)
        echo -e "${BLUE}Current Status: $STATUS${NC}"
        ;;
    "pause")
        pause_service
        ;;
    "resume")
        resume_service
        ;;
    "costs")
        show_costs
        ;;
    *)
        echo "Usage: $0 {status|pause|resume|costs}"
        echo ""
        echo "Commands:"
        echo "  status  - Check current service status"
        echo "  pause   - Pause service (saves money)"
        echo "  resume  - Resume service"
        echo "  costs   - Show cost breakdown"
        echo ""
        show_costs
        ;;
esac 
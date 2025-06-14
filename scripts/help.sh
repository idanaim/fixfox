#!/bin/bash

# FixFox Deployment Help
# Shows all available commands and their purposes

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 FixFox Deployment Commands${NC}"
echo "============================="
echo ""

echo -e "${GREEN}📋 Setup Commands (One-time)${NC}"
echo "-----------------------------"
echo "• ./scripts/create-dev-branch.sh      - Create dev branch"
echo "• ./scripts/setup-app-runner-dev.sh   - Create development environment"
echo "• ./scripts/setup-app-runner-prod.sh  - Create production environment"
echo ""

echo -e "${GREEN}🚀 Deployment Commands (Daily use)${NC}"
echo "-----------------------------------"
echo "• ./scripts/deploy-dev.sh             - Deploy to development"
echo "• ./scripts/deploy-prod.sh            - Deploy to production (with confirmation)"
echo ""

echo -e "${GREEN}📊 Monitoring Commands${NC}"
echo "-----------------------"
echo "• ./scripts/check-app-runner-status.sh - Check service status"
echo "• ./scripts/manage-app-runner-costs.sh - Manage costs and pause services"
echo ""

echo -e "${GREEN}🔧 Utility Commands${NC}"
echo "-------------------"
echo "• ./scripts/setup-s3-bucket.sh        - Setup S3 bucket for file storage"
echo "• ./scripts/help.sh                   - Show this help message"
echo ""

echo -e "${GREEN}📚 Documentation${NC}"
echo "------------------"
echo "• scripts/README-environments.md      - Complete multi-environment guide"
echo "• scripts/app-runner-setup-guide.md   - Detailed setup instructions"
echo ""

echo -e "${YELLOW}🌿 Branch Strategy${NC}"
echo "------------------"
echo "• dev branch  → Development environment (fixfox-api-dev)"
echo "• main branch → Production environment (fixfox-api-prod)"
echo ""

echo -e "${YELLOW}🔗 Quick Links${NC}"
echo "---------------"
echo "• AWS App Runner Console: https://console.aws.amazon.com/apprunner/"
echo "• CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/"
echo ""

echo -e "${BLUE}💡 Quick Start${NC}"
echo "---------------"
echo "1. Create dev branch:        ./scripts/create-dev-branch.sh"
echo "2. Authorize GitHub in AWS Console (see README)"
echo "3. Setup environments:      ./scripts/setup-app-runner-dev.sh"
echo "                            ./scripts/setup-app-runner-prod.sh"
echo "4. Deploy to development:   ./scripts/deploy-dev.sh"
echo "5. Deploy to production:    ./scripts/deploy-prod.sh"
echo ""

echo -e "${BLUE}📖 For detailed instructions, read:${NC}"
echo "scripts/README-environments.md" 
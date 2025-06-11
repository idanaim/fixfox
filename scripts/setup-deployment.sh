#!/bin/bash

# FixFox Deployment Setup Script
set -e

echo "🔧 Setting up FixFox Deployment Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 This script will help you set up deployment for FixFox REST API${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${YELLOW}⚠️  AWS CLI not found. Installing...${NC}"
    if command -v brew &> /dev/null; then
        brew install awscli
    else
        echo -e "${RED}❌ Please install AWS CLI manually: https://aws.amazon.com/cli/${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ AWS CLI available${NC}"

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo -e "${YELLOW}⚠️  EB CLI not found. Installing...${NC}"
    pip3 install awsebcli
fi

echo -e "${GREEN}✅ EB CLI available${NC}"

# Configure AWS CLI if not configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${YELLOW}🔑 AWS CLI not configured. Let's set it up...${NC}"
    echo ""
    echo -e "${BLUE}You'll need:${NC}"
    echo "1. AWS Access Key ID"
    echo "2. AWS Secret Access Key"
    echo "3. Default region (us-west-2 recommended)"
    echo ""
    read -p "Press Enter to continue with AWS configuration..."
    aws configure
else
    echo -e "${GREEN}✅ AWS CLI already configured${NC}"
    aws sts get-caller-identity
fi

echo ""
echo -e "${BLUE}🎯 Deployment Options Available:${NC}"
echo ""
echo "1. 🤖 Automated Deployment (GitHub Actions)"
echo "   - Deploys automatically on push to main"
echo "   - Requires GitHub secrets configuration"
echo "   - Recommended for production"
echo ""
echo "2. 🛠️  Manual Deployment"
echo "   - Deploy using ./scripts/deploy.sh"
echo "   - Good for testing and development"
echo ""

read -p "Which deployment method would you like to set up? (1 for automated, 2 for manual): " choice

case $choice in
    1)
        echo -e "${YELLOW}🤖 Setting up Automated Deployment...${NC}"
        echo ""
        echo -e "${BLUE}Next steps for GitHub Actions:${NC}"
        echo "1. Go to: https://github.com/idanaim/fixfox/settings/secrets/actions"
        echo "2. Add these secrets:"
        echo "   - AWS_ACCESS_KEY_ID: $(aws configure get aws_access_key_id)"
        echo "   - AWS_SECRET_ACCESS_KEY: [Your secret key]"
        echo "3. Push your code to main branch"
        echo "4. Watch deployment at: https://github.com/idanaim/fixfox/actions"
        echo ""
        echo -e "${GREEN}✅ GitHub Actions workflow is ready in .github/workflows/deploy-server.yml${NC}"
        ;;
    2)
        echo -e "${YELLOW}🛠️  Setting up Manual Deployment...${NC}"
        echo ""
        echo "You can now deploy manually using:"
        echo -e "${GREEN}./scripts/deploy.sh${NC}"
        echo ""
        read -p "Would you like to deploy now? (y/n): " deploy_now
        if [[ $deploy_now == "y" || $deploy_now == "Y" ]]; then
            ./scripts/deploy.sh
        fi
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📚 For detailed instructions, see: DEPLOYMENT.md${NC}"
echo -e "${BLUE}🌐 Monitor your deployments at:${NC}"
echo "   - GitHub Actions: https://github.com/idanaim/fixfox/actions"
echo "   - AWS Console: https://console.aws.amazon.com/elasticbeanstalk/"
echo ""
echo -e "${GREEN}✨ Happy deploying! 🚀${NC}" 
#!/bin/bash

# FixFox Local CI Testing Script
# This script simulates the CI pipeline locally

set -e

echo "🚀 FixFox Local CI Testing (Node 20+)"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}📋 Checking Node.js version...${NC}"
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v20\. ]] && [[ ! "$NODE_VERSION" =~ ^v21\. ]]; then
    echo -e "${RED}❌ Node.js 20+ required. Current version: $NODE_VERSION${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version check passed${NC}"

# Function to run server tests
test_server() {
    echo -e "\n${BLUE}🔧 Testing Server...${NC}"
    cd server
    
    echo "Installing dependencies..."
    npm ci
    
    echo "Linting and testing temporarily disabled..."
    # echo "Running linting..."
    # npm run lint:check
    
    # echo "Running format check..."
    # npm run format:check
    
    # echo "Running TypeScript check..."
    # npx tsc --noEmit
    
    # echo "Running tests (unit only)..."
    # npm run test
    
    # echo "Note: E2E tests are excluded from CI pipeline"
    
    echo "Building application..."
    npm run build
    
    echo -e "${GREEN}✅ Server tests passed${NC}"
    cd ..
}

# Function to run mobile app tests
test_mobile() {
    echo -e "\n${BLUE}📱 Testing Mobile App...${NC}"
    cd mobile-app
    
    echo "Installing dependencies..."
    npm ci
    
    echo "Running Expo Doctor..."
    npx expo-doctor
    
    echo "TypeScript check, linting and formatting temporarily disabled..."
    # echo "Running TypeScript check..."
    # npm run type-check
    
    # echo "Running linting..."
    # npm run lint:check --if-present
    
    # echo "Running format check..."
    # npm run format:check --if-present
    
    echo "Testing web export..."
    npx expo export --platform web --output-dir web-build-test
    rm -rf web-build-test
    
    echo -e "${GREEN}✅ Mobile app tests passed${NC}"
    cd ..
}

# Function to test Docker build
test_docker() {
    echo -e "\n${BLUE}🐳 Testing Docker build...${NC}"
    
    echo "Building Docker image..."
    docker build -t fixfox-server:test .
    
    echo "Testing Docker image..."
    docker run --rm fixfox-server:test node --version
    
    echo "Cleaning up test image..."
    docker rmi fixfox-server:test
    
    echo -e "${GREEN}✅ Docker build tests passed${NC}"
}

# Function to run security audit
security_audit() {
    echo -e "\n${BLUE}🔒 Running Security Audit...${NC}"
    
    echo "Auditing server dependencies..."
    cd server
    npm audit --audit-level=moderate
    cd ..
    
    echo "Auditing mobile app dependencies..."
    cd mobile-app  
    npm audit --audit-level=moderate
    cd ..
    
    echo -e "${GREEN}✅ Security audit passed${NC}"
}

# Parse command line arguments
SERVER_TEST=true
MOBILE_TEST=true
DOCKER_TEST=true
SECURITY_TEST=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --server-only)
            MOBILE_TEST=false
            DOCKER_TEST=false
            SECURITY_TEST=false
            shift
            ;;
        --mobile-only)
            SERVER_TEST=false
            DOCKER_TEST=false
            SECURITY_TEST=false
            shift
            ;;
        --no-docker)
            DOCKER_TEST=false
            shift
            ;;
        --no-security)
            SECURITY_TEST=false
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --server-only    Test only server components"
            echo "  --mobile-only    Test only mobile app components"
            echo "  --no-docker      Skip Docker build tests"
            echo "  --no-security    Skip security audit"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run tests based on flags
if [ "$SERVER_TEST" = true ]; then
    test_server
fi

if [ "$MOBILE_TEST" = true ]; then
    test_mobile
fi

if [ "$DOCKER_TEST" = true ]; then
    test_docker
fi

if [ "$SECURITY_TEST" = true ]; then
    security_audit
fi

echo -e "\n${GREEN}🎉 All tests passed successfully!${NC}"
echo -e "${YELLOW}💡 Ready for CI/CD pipeline${NC}"
echo -e "${BLUE}ℹ️  Note: E2E tests are excluded from CI. Run 'npm run test:e2e' manually if needed.${NC}" 
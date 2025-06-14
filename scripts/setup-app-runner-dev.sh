#!/bin/bash

SERVICE_NAME="fixfox-api-dev"
REGION="us-west-2"
GITHUB_REPO="https://github.com/idanaim/fixfox"
BRANCH="dev"
ENV="development"

echo "🚀 Setting up AWS App Runner service: $SERVICE_NAME"
echo "Environment: $ENV"
echo "Repository: $GITHUB_REPO"
echo "Branch: $BRANCH"
echo "Region: $REGION"
echo ""

# Check if service already exists
echo "🔍 Checking if service already exists..."
EXISTING_SERVICE=$(aws apprunner list-services \
    --region $REGION \
    --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" \
    --output text 2>/dev/null)

if [ ! -z "$EXISTING_SERVICE" ] && [ "$EXISTING_SERVICE" != "None" ]; then
    echo "✅ Service '$SERVICE_NAME' already exists!"
    echo "ARN: $EXISTING_SERVICE"
    echo ""
    echo "You can now run: ./scripts/deploy-dev.sh"
    exit 0
fi

echo "📝 Creating App Runner service configuration for DEVELOPMENT..."

# Create App Runner service configuration for development
cat > apprunner-service-dev.json << EOF
{
  "ServiceName": "$SERVICE_NAME",
  "SourceConfiguration": {
    "AutoDeploymentsEnabled": true,
    "CodeRepository": {
      "RepositoryUrl": "$GITHUB_REPO",
      "SourceCodeVersion": {
        "Type": "BRANCH",
        "Value": "$BRANCH"
      },
      "CodeConfiguration": {
        "ConfigurationSource": "REPOSITORY"
      }
    }
  },
  "InstanceConfiguration": {
    "Cpu": "0.25 vCPU",
    "Memory": "0.5 GB"
  },
  "HealthCheckConfiguration": {
    "Protocol": "HTTP",
    "Path": "/api/health",
    "Interval": 10,
    "Timeout": 5,
    "HealthyThreshold": 1,
    "UnhealthyThreshold": 5
  },
  "Tags": [
    {
      "Key": "Environment",
      "Value": "development"
    },
    {
      "Key": "Project",
      "Value": "fixfox"
    }
  ]
}
EOF

echo "🚀 Creating DEVELOPMENT App Runner service..."
CREATE_OUTPUT=$(aws apprunner create-service \
    --cli-input-json file://apprunner-service-dev.json \
    --region $REGION 2>&1)

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DEVELOPMENT App Runner service creation initiated!"
    echo "Service name: $SERVICE_NAME"
    echo "Environment: $ENV"
    echo "Region: $REGION"
    echo ""
    echo "📊 Service Details:"
    echo "$CREATE_OUTPUT" | grep -E "(ServiceArn|ServiceUrl|Status)" || echo "$CREATE_OUTPUT"
    echo ""
    echo "⏳ The service will take 3-5 minutes to deploy."
    echo ""
    echo "🔗 Monitor progress at:"
    echo "https://console.aws.amazon.com/apprunner/"
    echo ""
    echo "✅ Once deployed, you can run:"
    echo "./scripts/deploy-dev.sh"
else
    echo ""
    echo "❌ Failed to create DEVELOPMENT App Runner service."
    echo "Error details:"
    echo "$CREATE_OUTPUT"
    echo ""
    
    if echo "$CREATE_OUTPUT" | grep -q "Authentication configuration is invalid"; then
        echo "🔗 GitHub Authorization Required:"
        echo "1. Go to: https://console.aws.amazon.com/apprunner/"
        echo "2. Click 'Create service'"
        echo "3. Choose 'Source code repository'"
        echo "4. Click 'Add new' next to GitHub"
        echo "5. Authorize AWS App Runner to access GitHub"
        echo "6. Then run this script again"
    elif echo "$CREATE_OUTPUT" | grep -q "AccessDenied"; then
        echo "🔑 Permission Issue:"
        echo "Your AWS user needs App Runner permissions."
        echo "Contact your AWS administrator."
    fi
fi

# Clean up
rm -f apprunner-service-dev.json

echo "" 
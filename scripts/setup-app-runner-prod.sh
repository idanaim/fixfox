#!/bin/bash

SERVICE_NAME="fixfox-api-prod"
REGION="us-west-2"
GITHUB_REPO="https://github.com/idanaim/fixfox"
BRANCH="main"

echo "Setting up AWS App Runner PRODUCTION service: $SERVICE_NAME"
echo "Repository: $GITHUB_REPO"
echo "Branch: $BRANCH"
echo "Region: $REGION"
echo ""

# Create App Runner service configuration
cat > apprunner-service-prod.json << EOF
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
        "ConfigurationSource": "REPOSITORY",
        "CodeConfigurationValues": {
          "Runtime": "NODEJS_18",
          "BuildCommand": "npm ci && npm run build",
          "StartCommand": "cd dist/apps/rest-man-server && node main.js",
          "Port": "3000",
          "RuntimeEnvironmentVariables": {
            "NODE_ENV": "production",
            "PORT": "3000"
          }
        }
      }
    }
  },
  "InstanceConfiguration": {
    "Cpu": "0.5 vCPU",
    "Memory": "1 GB"
  },
  "HealthCheckConfiguration": {
    "Protocol": "HTTP",
    "Path": "/api/health",
    "Interval": 10,
    "Timeout": 5,
    "HealthyThreshold": 1,
    "UnhealthyThreshold": 5
  }
}
EOF

echo "Creating App Runner PRODUCTION service..."
aws apprunner create-service \
    --cli-input-json file://apprunner-service-prod.json \
    --region $REGION

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ App Runner PRODUCTION service creation initiated!"
    echo "Service name: $SERVICE_NAME"
    echo "Region: $REGION"
    echo ""
    echo "The service will take a few minutes to deploy."
    echo "You can check the status with:"
    echo "./scripts/check-app-runner-status.sh"
    echo ""
    echo "Or manually:"
    echo "aws apprunner list-services --region $REGION"
else
    echo ""
    echo "❌ Failed to create App Runner PRODUCTION service."
    echo "Please check your AWS credentials and permissions."
fi

# Clean up
rm -f apprunner-service-prod.json

echo ""
echo "🚨 IMPORTANT: Environment Variables"
echo "You'll need to configure production environment variables:"
echo "- Database connection (if using external DB)"
echo "- OPENAI_API_KEY (if using OpenAI)"
echo "- Any other secrets"
echo ""
echo "Use AWS Console or AWS CLI to set these after service creation."
echo ""
echo "Note: You'll need to connect your GitHub repository to App Runner"
echo "This requires GitHub OAuth authorization in the AWS Console." 
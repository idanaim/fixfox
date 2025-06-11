#!/bin/bash

SERVICE_NAME="fixfox-api"
REGION="us-west-2"
GITHUB_REPO="https://github.com/idanaim/fixfox"
BRANCH="backend-aws"

echo "Setting up AWS App Runner service: $SERVICE_NAME"
echo "Repository: $GITHUB_REPO"
echo "Branch: $BRANCH"
echo "Region: $REGION"
echo ""

# Create App Runner service configuration
cat > apprunner-service.json << EOF
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
          "BuildCommand": "npm ci && NX_CLOUD_DISTRIBUTED_EXECUTION=false npx nx build rest-man-server --skip-nx-cache",
          "StartCommand": "cd dist/apps/rest-man-server && npm start",
          "Port": "3000",
          "RuntimeEnvironmentVariables": {
            "NODE_ENV": "production",
            "PORT": "3000",
            "OPENAI_API_KEY": "dummy-key-for-production"
          }
        }
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
  }
}
EOF

echo "Creating App Runner service..."
aws apprunner create-service \
    --cli-input-json file://apprunner-service.json \
    --region $REGION

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ App Runner service creation initiated!"
    echo "Service name: $SERVICE_NAME"
    echo "Region: $REGION"
    echo ""
    echo "The service will take a few minutes to deploy."
    echo "You can check the status with:"
    echo "aws apprunner describe-service --service-arn <service-arn> --region $REGION"
else
    echo ""
    echo "❌ Failed to create App Runner service."
    echo "Please check your AWS credentials and permissions."
fi

# Clean up
rm -f apprunner-service.json

echo ""
echo "Note: You'll need to connect your GitHub repository to App Runner"
echo "This requires GitHub OAuth authorization in the AWS Console." 
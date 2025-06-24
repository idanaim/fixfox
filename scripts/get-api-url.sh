#!/bin/bash

set -e

REGION="us-west-2"
PROJECT_NAME="fixfox"
ENVIRONMENT=${1:-prod}

echo "🔍 Finding API URL for FixFox $ENVIRONMENT environment"
echo "Region: $REGION"
echo ""

# Get ECS service information
echo "📊 Getting ECS service information..."
SERVICE_INFO=$(aws ecs describe-services \
  --cluster "${PROJECT_NAME}-${ENVIRONMENT}" \
  --services "${PROJECT_NAME}-api-${ENVIRONMENT}" \
  --region $REGION \
  --query 'services[0]' \
  --output json 2>/dev/null)

if [ $? -ne 0 ]; then
  echo "❌ ECS service not found. Make sure the service exists."
  exit 1
fi

# Extract target group ARN
TARGET_GROUP_ARN=$(echo $SERVICE_INFO | jq -r '.loadBalancers[0].targetGroupArn // empty')

if [ -z "$TARGET_GROUP_ARN" ] || [ "$TARGET_GROUP_ARN" = "null" ]; then
  echo "❌ No load balancer found for the service"
  echo "The service might not be configured with a load balancer"
  exit 1
fi

echo "✅ Found target group: $TARGET_GROUP_ARN"

# Get load balancer ARN from target group
echo "🔍 Getting load balancer information..."
LB_ARN=$(aws elbv2 describe-target-groups \
  --target-group-arns $TARGET_GROUP_ARN \
  --region $REGION \
  --query 'TargetGroups[0].LoadBalancerArns[0]' \
  --output text 2>/dev/null)

if [ -z "$LB_ARN" ] || [ "$LB_ARN" = "None" ]; then
  echo "❌ No load balancer found"
  exit 1
fi

# Get load balancer DNS name
LB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $LB_ARN \
  --region $REGION \
  --query 'LoadBalancers[0].DNSName' \
  --output text 2>/dev/null)

if [ -z "$LB_DNS" ] || [ "$LB_DNS" = "None" ]; then
  echo "❌ Could not get load balancer DNS name"
  exit 1
fi

# Construct URLs
API_BASE_URL="http://$LB_DNS"
HEALTH_URL="$API_BASE_URL/api/health"

echo "✅ Found load balancer DNS: $LB_DNS"
echo ""
echo "🌐 API URLs:"
echo "  Base URL: $API_BASE_URL"
echo "  Health Check: $HEALTH_URL"
echo "  API Endpoints: $API_BASE_URL/api/*"
echo ""

# Test the health endpoint
echo "🏥 Testing health endpoint..."
if curl -f -s "$HEALTH_URL" >/dev/null 2>&1; then
  echo "✅ API is responding!"
  echo ""
  echo "📊 Health response:"
  curl -s "$HEALTH_URL" | jq . 2>/dev/null || curl -s "$HEALTH_URL"
else
  echo "❌ API is not responding at $HEALTH_URL"
  echo "Check if the service is running:"
  echo "aws ecs describe-services --cluster ${PROJECT_NAME}-${ENVIRONMENT} --services ${PROJECT_NAME}-api-${ENVIRONMENT} --region $REGION"
fi

echo ""
echo "🔧 For UI testing, use this as your API base URL:"
echo "export REACT_APP_API_URL=\"$API_BASE_URL/api\""
echo ""
echo "📱 Common API endpoints to test:"
echo "  GET  $API_BASE_URL/api/health"
echo "  POST $API_BASE_URL/api/auth/login"
echo "  GET  $API_BASE_URL/api/businesses"
echo "  POST $API_BASE_URL/api/chat/message" 
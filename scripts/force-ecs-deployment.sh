#!/bin/bash

echo "🚀 Forcing ECS Deployment for FixFox API"
echo "======================================="

# Set variables
CLUSTER="fixfox-prod"
SERVICE="fixfox-api-prod"
REGION="us-west-2"

echo "📊 Current Service Status:"
aws ecs describe-services \
  --cluster $CLUSTER \
  --services $SERVICE \
  --region $REGION \
  --query 'services[0].{Status:status,RunningCount:runningCount,PendingCount:pendingCount,TaskDefinition:taskDefinition}' \
  --output table

echo ""
echo "🔄 Forcing New Deployment..."
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --region $REGION \
  --force-new-deployment

echo ""
echo "⏳ Waiting for deployment to stabilize..."
echo "This may take 5-10 minutes..."

aws ecs wait services-stable \
  --cluster $CLUSTER \
  --services $SERVICE \
  --region $REGION

echo ""
echo "🧪 Testing CORS Configuration..."
sleep 30

echo "Testing OPTIONS request:"
curl -X OPTIONS 'http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api/auth/login' \
  -H 'Origin: http://localhost:8081' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type,Authorization,token' \
  -v

echo ""
echo "✅ Force deployment complete!" 
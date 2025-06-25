#!/bin/bash

echo "🔍 Checking FixFox ECS Service Status..."
echo "========================================="

# Check service status
echo "📊 Service Overview:"
aws ecs describe-services \
  --cluster fixfox-prod \
  --services fixfox-api-prod \
  --region us-west-2 \
  --query 'services[0].{
    Status:status,
    RunningCount:runningCount,
    PendingCount:pendingCount,
    DesiredCount:desiredCount,
    TaskDefinition:taskDefinition,
    LastDeployment:deployments[0].status
  }' \
  --output table

echo ""
echo "🏃 Running Tasks:"
aws ecs list-tasks \
  --cluster fixfox-prod \
  --service-name fixfox-api-prod \
  --region us-west-2 \
  --query 'taskArns' \
  --output table

echo ""
echo "🔍 Recent Deployments:"
aws ecs describe-services \
  --cluster fixfox-prod \
  --services fixfox-api-prod \
  --region us-west-2 \
  --query 'services[0].deployments[0:3].{
    Status:status,
    CreatedAt:createdAt,
    TaskDefinition:taskDefinition,
    RunningCount:runningCount
  }' \
  --output table

echo ""
echo "🌐 Testing API Health:"
echo "GET /api:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api

echo ""
echo "GET /api/businesses/[test-id]:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api/businesses/74249b89-98d9-4827-978f-e01db115e487

echo ""
echo "✅ Check complete!" 
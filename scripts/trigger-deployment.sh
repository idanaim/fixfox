#!/bin/bash

set -e

echo "🚀 Triggering ECS Deployment"
echo "==========================="
echo "This script assumes the 'latest' Docker image has been pushed to ECR by the GitHub Actions workflow."
echo ""

# Configuration
REGION="us-west-2"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="fixfox-api"
CLUSTER="fixfox-prod"
SERVICE="fixfox-api-prod"
TASK_DEF="fixfox-api-prod"

# 1. Create and Register the Task Definition
echo "📋 Step 1: Creating and registering new task definition..."
cat > task-definition-deploy.json << EOFTASK
{
  "family": "$TASK_DEF",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/fixfox-task-execution-role-prod",
  "taskRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/fixfox-task-role-prod",
  "containerDefinitions": [
    {
      "name": "fixfox-api",
      "image": "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest",
      "portMappings": [{"containerPort": 3000, "protocol": "tcp"}],
      "essential": true,
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$TASK_DEF",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"},
        {"name": "DB_HOST", "value": "fixfoxdb.cb8aywmkgppq.us-west-2.rds.amazonaws.com"},
        {"name": "DB_PORT", "value": "5432"},
        {"name": "DB_USERNAME", "value": "idanaim"},
        {"name": "DB_PASSWORD", "value": "In16051982"},
        {"name": "DB_DATABASE", "value": "fixfoxdb"}
      ]
    }
  ]
}
EOFTASK

NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file://task-definition-deploy.json \
  --region $REGION \
  --query 'taskDefinition.taskDefinitionArn' --output text)
echo "New task definition registered: $NEW_TASK_DEF_ARN"

# 2. Update ECS Service
echo "🚀 Step 2: Updating ECS service to use new task definition..."
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --task-definition "$NEW_TASK_DEF_ARN" \
  --force-new-deployment \
  --region $REGION > /dev/null

rm -f task-definition-deploy.json

echo ""
echo "✅ Deployment triggered."
echo "⏳ Waiting for the service to become stable..."
echo ""

# 3. Monitor Deployment
aws ecs wait services-stable --cluster $CLUSTER --services $SERVICE --region $REGION

echo "🎉 Success! The service is stable and the new tasks are running."
echo ""

# 4. Final Health Check
echo "🔍 Performing final health check..."
ALB_DNS="fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com"
HEALTH_URL="http://$ALB_DNS/api/health"

if curl --silent --fail --max-time 10 "$HEALTH_URL"; then
  echo "✅ Health check successful! The API is live at $HEALTH_URL"
else
  echo "⚠️ Health check failed after deployment. Please check the container logs in CloudWatch."
  exit 1
fi

exit 0 
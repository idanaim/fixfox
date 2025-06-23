#!/bin/bash

set -e

echo "🔥 FORCING FRESH ECS DEPLOYMENT"
echo "==============================="
echo "This script will force ECS to pull a completely fresh Docker image"
echo "by stopping all running tasks and creating new ones."
echo ""

# Configuration
REGION="us-west-2"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="fixfox-api"
CLUSTER="fixfox-prod"
SERVICE="fixfox-api-prod"
TASK_DEF="fixfox-api-prod"

echo "📋 Step 1: Stopping all running tasks to force fresh image pull..."

# Get all running task ARNs
RUNNING_TASKS=$(aws ecs list-tasks --cluster $CLUSTER --service-name $SERVICE --region $REGION --query 'taskArns[]' --output text)

# Stop each running task
if [ ! -z "$RUNNING_TASKS" ]; then
    for TASK_ARN in $RUNNING_TASKS; do
        echo "Stopping task: $TASK_ARN"
        aws ecs stop-task --cluster $CLUSTER --task $TASK_ARN --region $REGION --reason "Force fresh deployment" > /dev/null
    done
    echo "✅ All running tasks stopped"
else
    echo "ℹ️ No running tasks found"
fi

echo ""
echo "📋 Step 2: Creating new task definition with force-fresh image..."

# Create task definition with current timestamp to ensure fresh pull
TIMESTAMP=$(date +%s)
cat > task-definition-fresh.json << EOFTASK
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
        {"name": "DB_DATABASE", "value": "fixfoxdb"},
        {"name": "FORCE_FRESH_DEPLOY", "value": "$TIMESTAMP"}
      ]
    }
  ]
}
EOFTASK

NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file://task-definition-fresh.json \
  --region $REGION \
  --query 'taskDefinition.taskDefinitionArn' --output text)
echo "✅ New task definition registered: $NEW_TASK_DEF_ARN"

echo ""
echo "🚀 Step 3: Forcing ECS service to use new task definition..."
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --task-definition "$NEW_TASK_DEF_ARN" \
  --force-new-deployment \
  --region $REGION > /dev/null

rm -f task-definition-fresh.json

echo "✅ Fresh deployment triggered with force-new-deployment flag"
echo "⏳ Waiting for the service to become stable..."
echo ""

# Monitor Deployment
aws ecs wait services-stable --cluster $CLUSTER --services $SERVICE --region $REGION

echo "🎉 Success! The service is stable with fresh tasks."
echo ""

# Final Health Check
echo "🔍 Performing final health check..."
ALB_DNS="fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com"
HEALTH_URL="http://$ALB_DNS/api/health"

echo "Testing: $HEALTH_URL"
if curl --silent --fail --max-time 10 "$HEALTH_URL"; then
  echo ""
  echo "✅ SUCCESS! Health check passed! The API is live with the fresh image."
else
  echo ""
  echo "⚠️ Health check failed. Checking recent logs..."
  aws logs tail /ecs/$TASK_DEF --region $REGION --since 2m
  exit 1
fi

exit 0 
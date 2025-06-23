#!/bin/bash

set -e

echo "🚀 Deploying Standalone FixFox Server"
echo "====================================="
echo ""

# Configuration
REGION="us-west-2"
ACCOUNT_ID="993512230158"
ECR_REPO="fixfox-api"
CLUSTER="fixfox-prod"
SERVICE="fixfox-api-prod"
TASK_DEF="fixfox-api-prod"

# Build the application
echo "🔨 Step 1: Building Docker image..."
docker build -t $ECR_REPO:latest .

# Login to ECR
echo "🔐 Step 2: Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Tag and push image
echo "📤 Step 3: Pushing image to ECR..."
docker tag $ECR_REPO:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest

# Force new task definition by stopping current tasks first
echo "🛑 Step 4: Stopping current tasks to force restart..."
TASK_ARNS=$(aws ecs list-tasks --cluster $CLUSTER --service-name $SERVICE --region $REGION --query 'taskArns' --output text)
if [ -n "$TASK_ARNS" ] && [ "$TASK_ARNS" != "None" ]; then
  for TASK_ARN in $TASK_ARNS; do
    echo "Stopping task: $TASK_ARN"
    aws ecs stop-task --cluster $CLUSTER --task $TASK_ARN --region $REGION >/dev/null 2>&1 || true
  done
fi

# Wait a moment for tasks to stop
echo "⏳ Waiting for tasks to stop..."
sleep 30

# Create new task definition with real image
echo "📋 Step 5: Creating new task definition..."
cat > task-definition-real.json << EOF
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
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$TASK_DEF",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        },
        {
          "name": "OPENAI_API_KEY",
          "value": "dummy-key-for-demo"
        },
        {
          "name": "DB_HOST",
          "value": "fixfoxdb.cb8aywmkgppq.us-west-2.rds.amazonaws.com"
        },
        {
          "name": "DB_PORT",
          "value": "5432"
        },
        {
          "name": "DB_USERNAME",
          "value": "idanaim"
        },
        {
          "name": "DB_PASSWORD",
          "value": "In16051982"
        },
        {
          "name": "DB_DATABASE",
          "value": "fixfoxdb"
        }
      ]
    }
  ]
}
EOF

# Register new task definition
echo "📝 Step 6: Registering new task definition..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file://task-definition-real.json \
  --region $REGION \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "New task definition: $NEW_TASK_DEF_ARN"

# Update service with force new deployment
echo "🚀 Step 7: Updating ECS service with force new deployment..."
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --task-definition "$NEW_TASK_DEF_ARN" \
  --force-new-deployment \
  --region $REGION

# Clean up
rm -f task-definition-real.json

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "🔍 Monitoring deployment progress..."

# Monitor deployment for a few minutes
for i in {1..10}; do
  echo "Check $i/10..."
  
  # Get service status
  SERVICE_STATUS=$(aws ecs describe-services \
    --cluster $CLUSTER \
    --services $SERVICE \
    --region $REGION \
    --query 'services[0].{Running:runningCount,Desired:desiredCount,Status:status}' \
    --output text)
  
  echo "Service status: $SERVICE_STATUS"
  
  # Check recent logs
  echo "Recent logs:"
  aws logs tail /ecs/$TASK_DEF --region $REGION --since 2m | tail -5
  
  # Test health endpoint
  ALB_DNS="fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com"
  HEALTH_URL="http://$ALB_DNS/api/health"
  
  echo "Testing health endpoint: $HEALTH_URL"
  if curl -f -m 5 "$HEALTH_URL" 2>/dev/null; then
    echo ""
    echo "🎉 Health check successful!"
    echo "🌐 API is now available at: $HEALTH_URL"
    exit 0
  else
    echo "Health check failed, waiting 30 seconds..."
    sleep 30
  fi
done

echo ""
echo "⚠️  Deployment monitoring complete. Check status manually:"
echo "🔍 Service status: aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION"
echo "📝 Logs: aws logs tail /ecs/$TASK_DEF --region $REGION --since 10m" 
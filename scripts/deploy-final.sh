#!/bin/bash

set -e

echo "🚀 Deploying Standalone FixFox Server (Final Architecture Fix)"
echo "============================================================"
echo ""

# Configuration
REGION="us-west-2"
ACCOUNT_ID="993512230158"
ECR_REPO="fixfox-api"
CLUSTER="fixfox-prod"
SERVICE="fixfox-api-prod"
TASK_DEF="fixfox-api-prod"

# 1. Setup Docker Buildx
echo "🔧 Step 1: Setting up Docker Buildx for multi-platform builds..."
if ! docker buildx ls | grep -q "multi-platform-builder"; then
  echo "Creating new multi-platform builder..."
  docker buildx create --name multi-platform-builder --use
else
  echo "Using existing multi-platform builder."
  docker buildx use multi-platform-builder
fi
docker buildx inspect --bootstrap

# 2. Build for linux/amd64 and load into local Docker
echo "🔨 Step 2: Building Docker image for linux/amd64..."
docker buildx build --platform linux/amd64 -t $ECR_REPO:latest --load .

# 3. Login to ECR
echo "🔐 Step 3: Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# 4. Tag and push image
echo "📤 Step 4: Pushing image to ECR..."
docker tag $ECR_REPO:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest

# 5. Create and Register Task Definition
echo "📋 Step 5: Creating and registering new task definition..."
# Using a 'here document' to create the JSON file
cat > task-definition-final.json << EOFTASK
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
  --cli-input-json file://task-definition-final.json \
  --region $REGION \
  --query 'taskDefinition.taskDefinitionArn' --output text)
echo "New task definition registered: $NEW_TASK_DEF_ARN"

# 6. Update ECS Service
echo "🚀 Step 6: Updating ECS service and forcing new deployment..."
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --task-definition "$NEW_TASK_DEF_ARN" \
  --force-new-deployment \
  --region $REGION > /dev/null

# 7. Clean up
rm -f task-definition-final.json

echo ""
echo "✅ Deployment initiated with correct architecture."
echo "⏳ The service is stabilizing. This may take several minutes."
echo ""

# 8. Monitor Deployment
echo "🔍 Monitoring deployment and health check..."
ALB_DNS="fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com"
HEALTH_URL="http://$ALB_DNS/api/health"

for i in {1..20}; do
  echo -n "Attempt $i/20: "
  
  # Check service stability
  RUNNING_COUNT=$(aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION --query 'services[0].runningCount' --output text)
  DESIRED_COUNT=$(aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION --query 'services[0].desiredCount' --output text)
  
  echo -n "Service status ($RUNNING_COUNT/$DESIRED_COUNT running)... "
  
  if [ "$RUNNING_COUNT" -eq "$DESIRED_COUNT" ]; then
    echo -n "Checking health... "
    # Check health endpoint
    if curl -s -f -m 5 "$HEALTH_URL" > /dev/null; then
      echo "✅ SUCCESS!"
      echo ""
      echo "🎉 Deployment complete and health check is passing."
      echo "🌐 API is available at: $HEALTH_URL"
      exit 0
    else
      echo "Still initializing."
    fi
  fi
  sleep 30
done

echo ""
echo "⚠️  Deployment timed out after 10 minutes."
echo "The service might still be starting. Please check the AWS Console for the latest status."
echo "To debug:"
echo "1. Check service events: aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION"
echo "2. Check task logs: aws logs tail /ecs/$TASK_DEF --region $REGION --since 15m"
exit 1 
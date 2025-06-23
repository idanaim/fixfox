#!/bin/bash

set -e

echo "🚀 Deploying with Correct Architecture via Buildx"
echo "================================================="
echo ""

# Configuration
REGION="us-west-2"
ACCOUNT_ID="993512230158"
ECR_REPO="fixfox-api"
CLUSTER="fixfox-prod"
SERVICE="fixfox-api-prod"
TASK_DEF="fixfox-api-prod"

# 1. Use the multi-platform builder
echo "🔧 Step 1: Ensuring multi-platform builder is active..."
docker buildx use multi-platform-builder

# 2. Build the image for the correct platform (linux/amd64)
echo "🔨 Step 2: Building Docker image for linux/amd64..."
# The --load flag builds it and loads it to the local Docker daemon
docker buildx build --platform linux/amd64 -t $ECR_REPO:latest --load .

# 3. Login to ECR
echo "🔐 Step 3: Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# 4. Tag and push the correctly-built image
echo "📤 Step 4: Pushing image to ECR..."
docker tag $ECR_REPO:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest

# 5. Create and Register the Task Definition
echo "📋 Step 5: Creating and registering new task definition..."
# This includes a container-level health check, as recommended.
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

# 6. Update ECS Service and force redeployment
echo "🚀 Step 6: Updating ECS service..."
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --task-definition "$NEW_TASK_DEF_ARN" \
  --force-new-deployment \
  --region $REGION > /dev/null

rm -f task-definition-final.json

echo ""
echo "✅ Deployment initiated. The container will now have the correct architecture."
echo "⏳ Waiting for the service to stabilize and pass health checks..."
echo ""

# 7. Monitor the deployment
aws ecs wait services-stable --cluster $CLUSTER --services $SERVICE --region $REGION

echo ""
echo "🎉 Success! The service is stable and the new task is running."

# 8. Final Health Check
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
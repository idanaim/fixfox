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

# Create new task definition with real image
echo "📋 Step 4: Creating new task definition..."
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
echo "📝 Step 5: Registering new task definition..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file://task-definition-real.json \
  --region $REGION \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "New task definition: $NEW_TASK_DEF_ARN"

# Update service
echo "🚀 Step 6: Updating ECS service..."
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --task-definition "$NEW_TASK_DEF_ARN" \
  --region $REGION

# Wait for deployment
echo "⏳ Step 7: Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster $CLUSTER \
  --services $SERVICE \
  --region $REGION

# Clean up
rm -f task-definition-real.json

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Testing health endpoint..."
sleep 30  # Give it time to start

# Test health check
ALB_DNS="fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com"
HEALTH_URL="http://$ALB_DNS/api/health"

echo "Testing: $HEALTH_URL"
for i in {1..5}; do
  echo "Attempt $i/5..."
  if curl -f -m 10 "$HEALTH_URL"; then
    echo ""
    echo "🎉 Health check successful!"
    exit 0
  else
    echo "Failed, waiting 30 seconds..."
    sleep 30
  fi
done

echo ""
echo "⚠️  Health check still failing, but deployment is complete."
echo "Check the logs and target group health in AWS console." 
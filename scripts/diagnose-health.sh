#!/bin/bash

echo "🔍 FixFox Health Check Diagnosis"
echo "================================="
echo ""

REGION="us-west-2"
CLUSTER="fixfox-prod"
SERVICE="fixfox-api-prod"
TASK_DEF="fixfox-api-prod"

echo "📊 Step 1: ECS Service Status"
echo "------------------------------"
aws ecs describe-services \
  --cluster $CLUSTER \
  --services $SERVICE \
  --region $REGION \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount,TaskDef:taskDefinition}' \
  --output table

echo ""
echo "📋 Step 2: Current Task Definition"
echo "-----------------------------------"
TASK_DEF_ARN=$(aws ecs describe-services \
  --cluster $CLUSTER \
  --services $SERVICE \
  --region $REGION \
  --query 'services[0].taskDefinition' \
  --output text)

echo "Task Definition ARN: $TASK_DEF_ARN"

aws ecs describe-task-definition \
  --task-definition $TASK_DEF_ARN \
  --region $REGION \
  --query 'taskDefinition.containerDefinitions[0].{Image:image,Command:command,Port:portMappings[0].containerPort}' \
  --output table

echo ""
echo "🏃 Step 3: Running Tasks"
echo "------------------------"
TASK_ARNS=$(aws ecs list-tasks \
  --cluster $CLUSTER \
  --service-name $SERVICE \
  --region $REGION \
  --query 'taskArns' \
  --output text)

if [ -n "$TASK_ARNS" ]; then
  echo "Found tasks: $TASK_ARNS"
  
  for TASK_ARN in $TASK_ARNS; do
    echo ""
    echo "Task: $TASK_ARN"
    aws ecs describe-tasks \
      --cluster $CLUSTER \
      --tasks $TASK_ARN \
      --region $REGION \
      --query 'tasks[0].{Status:lastStatus,Health:healthStatus,Created:createdAt}' \
      --output table
  done
else
  echo "❌ No running tasks found"
fi

echo ""
echo "📝 Step 4: Recent Logs"
echo "----------------------"
aws logs tail /ecs/$TASK_DEF --region $REGION --since 3m

echo ""
echo "🌐 Step 5: Load Balancer Health"
echo "-------------------------------"
TARGET_GROUP_ARN=$(aws ecs describe-services \
  --cluster $CLUSTER \
  --services $SERVICE \
  --region $REGION \
  --query 'services[0].loadBalancers[0].targetGroupArn' \
  --output text)

if [ "$TARGET_GROUP_ARN" != "None" ]; then
  echo "Target Group: $TARGET_GROUP_ARN"
  
  aws elbv2 describe-target-health \
    --target-group-arn $TARGET_GROUP_ARN \
    --region $REGION \
    --query 'TargetHealthDescriptions[*].{Target:Target.Id,Port:Target.Port,Health:TargetHealth.State,Reason:TargetHealth.Reason}' \
    --output table
else
  echo "❌ No load balancer found"
fi

echo ""
echo "🧪 Step 6: Direct Health Check Test"
echo "------------------------------------"
ALB_DNS="fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com"
HEALTH_URL="http://$ALB_DNS/api/health"

echo "Testing: $HEALTH_URL"
echo "Timeout: 10 seconds"

curl -m 10 -v "$HEALTH_URL" 2>&1 | head -20

echo ""
echo "🎯 Step 7: Network Connectivity"
echo "-------------------------------"
echo "Testing basic connectivity to load balancer..."
curl -m 5 -I "http://$ALB_DNS" 2>&1 | head -10

echo ""
echo "🔚 Diagnosis Complete"
echo "====================" 
#!/bin/bash

set -e

echo "🚨 NUCLEAR DEPLOYMENT - COMPLETE REBUILD"
echo "========================================"
echo "This script will:"
echo "1. Delete ALL images from ECR"
echo "2. Force GitHub Actions to rebuild from scratch"
echo "3. Deploy the fresh image"
echo ""

# Configuration
REGION="us-west-2"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="fixfox-api"
CLUSTER="fixfox-prod"
SERVICE="fixfox-api-prod"

echo "📋 Step 1: Deleting ALL images from ECR to force fresh build..."

# Get all image digests
IMAGE_DIGESTS=$(aws ecr list-images --repository-name $ECR_REPO --region $REGION --query 'imageIds[].imageDigest' --output text)

if [ ! -z "$IMAGE_DIGESTS" ]; then
    echo "🗑️  Found images to delete. Removing all cached images..."
    for digest in $IMAGE_DIGESTS; do
        aws ecr batch-delete-image --repository-name $ECR_REPO --region $REGION --image-ids imageDigest=$digest || true
    done
    echo "✅ All ECR images deleted"
else
    echo "ℹ️  No images found in ECR"
fi

echo ""
echo "📋 Step 2: Triggering fresh GitHub Actions build..."

# Add a timestamp to force a unique commit
TIMESTAMP=$(date +%s)
git add -A
git commit --allow-empty -m "🚨 NUCLEAR DEPLOYMENT: Force complete rebuild - timestamp: $TIMESTAMP

- Deleted all ECR images
- Forcing fresh Docker build
- This should deploy Node 20 with crypto fix"

git push

echo "✅ Pushed to trigger GitHub Actions"
echo ""
echo "📋 Step 3: Waiting for GitHub Actions to complete..."
echo "⏳ Please wait 3-4 minutes for the build to complete..."

# Wait for build
sleep 240

echo ""
echo "📋 Step 4: Deploying fresh image..."

# Force new deployment
aws ecs update-service \
    --cluster $CLUSTER \
    --service $SERVICE \
    --region $REGION \
    --force-new-deployment \
    --desired-count 1

echo "✅ Deployment triggered"
echo ""
echo "📋 Step 5: Monitoring deployment..."

# Wait for deployment to stabilize
aws ecs wait services-stable \
    --cluster $CLUSTER \
    --services $SERVICE \
    --region $REGION

echo ""
echo "🎉 NUCLEAR DEPLOYMENT COMPLETE!"
echo "The service should now be running with:"
echo "- Node.js 20"
echo "- Crypto polyfill fix"
echo "- Fresh Docker image"
echo ""
echo "Check logs with:"
echo "aws logs tail /ecs/fixfox-api-prod --region us-west-2 --since 5m" 
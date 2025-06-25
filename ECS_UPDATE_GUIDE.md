# 🚀 **ECS Update Guide: Ensuring Latest Server Changes**

## **Current Deployment Setup**

Your FixFox project has an automated deployment pipeline that:
- ✅ Automatically builds and deploys on pushes to `main` or `dev` branches
- ✅ Uses GitHub Actions for CI/CD
- ✅ Deploys to AWS ECS with zero downtime
- ✅ Updates ECR with latest Docker images

## **Method 1: Automatic Deployment (Recommended)**

### **Triggers Automatic Deployment:**
- Push changes to `main` or `dev` branches
- Modify files in `server/` directory
- Update `Dockerfile`
- Change deployment workflow (`.github/workflows/deploy.yml`)

### **To Force Automatic Deployment:**
```bash
# Option A: Make a small change to trigger deployment
echo "# Deployment trigger $(date)" >> server/README.md
git add .
git commit -m "trigger deployment: update server"
git push origin main

# Option B: Update deployment workflow
touch .github/workflows/deploy.yml
git add .
git commit -m "trigger deployment: refresh workflow"
git push origin main
```

## **Method 2: Manual GitHub Actions Trigger**

### **Via GitHub Web Interface:**
1. Go to: https://github.com/YOUR_USERNAME/fixfox/actions
2. Click on "Build and Deploy Server" workflow
3. Click "Run workflow" button
4. Select branch (`main` or `dev`)
5. Click "Run workflow"

### **Via GitHub CLI (if installed):**
```bash
# Install GitHub CLI if not installed
brew install gh

# Trigger deployment workflow
gh workflow run deploy.yml --ref main
```

### **Via API (using curl):**
```bash
# Replace YOUR_GITHUB_TOKEN with your personal access token
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/YOUR_USERNAME/fixfox/actions/workflows/deploy.yml/dispatches \
  -d '{"ref":"main"}'
```

## **Method 3: Direct ECS Force Deployment**

### **Using AWS CLI:**
```bash
# Force new deployment (pulls latest image)
aws ecs update-service \
  --cluster fixfox-prod \
  --service fixfox-api-prod \
  --force-new-deployment \
  --region us-west-2

# Wait for deployment to complete
aws ecs wait services-stable \
  --cluster fixfox-prod \
  --services fixfox-api-prod \
  --region us-west-2
```

### **Using AWS Console:**
1. Go to AWS ECS Console
2. Navigate to Clusters → fixfox-prod
3. Click on service: fixfox-api-prod
4. Click "Update service"
5. Check "Force new deployment"
6. Click "Update"

## **Method 4: Docker Image Update**

### **Check Current Image:**
```bash
# Check what image is currently running
aws ecs describe-services \
  --cluster fixfox-prod \
  --services fixfox-api-prod \
  --region us-west-2 \
  --query 'services[0].taskDefinition'

# Check task definition details
aws ecs describe-task-definition \
  --task-definition fixfox-api-prod \
  --region us-west-2 \
  --query 'taskDefinition.containerDefinitions[0].image'
```

### **Verify Latest Image in ECR:**
```bash
# List latest images in ECR
aws ecr describe-images \
  --repository-name fixfox-api \
  --region us-west-2 \
  --query 'sort_by(imageDetails,&imagePushedAt)[-5:].[imageTags[0],imagePushedAt]' \
  --output table
```

## **Verification Steps**

### **1. Check Deployment Status:**
```bash
# Check service status
aws ecs describe-services \
  --cluster fixfox-prod \
  --services fixfox-api-prod \
  --region us-west-2 \
  --query 'services[0].{Status:status,RunningCount:runningCount,PendingCount:pendingCount}'
```

### **2. Test API Endpoints:**
```bash
# Test production API
curl -X GET http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api/user/all/74249b89-98d9-4827-978f-e01db115e487

# Test health endpoint
curl -X GET http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api/health
```

### **3. Check Application Logs:**
```bash
# Get recent logs from ECS tasks
aws logs filter-log-events \
  --log-group-name /ecs/fixfox-api-prod \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --region us-west-2
```

## **Monitoring Deployment Progress**

### **GitHub Actions:**
- Monitor: https://github.com/YOUR_USERNAME/fixfox/actions
- Check workflow run status
- View deployment logs

### **AWS ECS:**
- Monitor service events
- Check task health
- View CloudWatch logs

### **Load Balancer:**
- Check target group health
- Monitor response times
- Verify routing

## **Current Configuration Summary**

- **ECS Cluster:** fixfox-prod
- **ECS Service:** fixfox-api-prod
- **ECR Repository:** fixfox-api
- **Load Balancer:** fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com
- **API URL:** http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api
- **Region:** us-west-2

## **Troubleshooting**

### **Common Issues:**

1. **Deployment Stuck:**
   ```bash
   # Check service events
   aws ecs describe-services --cluster fixfox-prod --services fixfox-api-prod --region us-west-2 --query 'services[0].events[0:5]'
   ```

2. **Image Not Updating:**
   ```bash
   # Verify latest image exists in ECR
   aws ecr describe-images --repository-name fixfox-api --region us-west-2 --image-ids imageTag=latest
   ```

3. **Health Check Failing:**
   ```bash
   # Check target group health
   aws elbv2 describe-target-health --target-group-arn YOUR_TARGET_GROUP_ARN --region us-west-2
   ```

## **Best Practices**

1. **Always use GitHub Actions for deployments** (maintains audit trail)
2. **Test changes in dev branch first** before pushing to main
3. **Monitor deployment progress** through GitHub Actions and AWS Console
4. **Verify API functionality** after each deployment
5. **Keep deployment logs** for troubleshooting

## **Quick Commands Reference**

```bash
# Quick deployment trigger
echo "# Deploy $(date)" >> server/package.json && git add . && git commit -m "trigger deployment" && git push origin main

# Check deployment status
aws ecs describe-services --cluster fixfox-prod --services fixfox-api-prod --region us-west-2 --query 'services[0].status'

# Test API
curl http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api/businesses/74249b89-98d9-4827-978f-e01db115e487

# Force ECS deployment
aws ecs update-service --cluster fixfox-prod --service fixfox-api-prod --force-new-deployment --region us-west-2
```

---

**The most reliable way to ensure ECS is up to date is to push a small change to the main branch, which will trigger the complete CI/CD pipeline and guarantee the latest code is deployed.** 
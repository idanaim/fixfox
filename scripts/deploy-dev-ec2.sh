#!/bin/bash

set -e

# ==============================================================================
#
#  FixFox Development EC2 Deployment Script
#
#  This script automates the entire process of provisioning a development
#  environment on a t2.micro EC2 instance and deploying the FixFox server.
#
#  - Provisions a t2.micro EC2 instance with required IAM roles and security groups.
#  - Builds the server Docker image and pushes it to an ECR repository.
#  - Creates a deployment package with docker-compose.yml and a .env file.
#  - Securely copies the package to the EC2 instance.
#  - Connects to the instance via SSH to pull the latest image and start the server.
#
# ==============================================================================

# --- Configuration ---
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-west-2"
PROJECT_NAME="fixfox"
ENVIRONMENT="dev"
INSTANCE_TYPE="t2.micro" # Free-tier eligible
ECR_REPO_NAME="${PROJECT_NAME}-api"
ECR_REPO_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO_NAME}"
IMAGE_TAG="latest"

# Use the latest Amazon Linux 2 AMI for the region
AMI_ID=$(aws ssm get-parameters --names /aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2 --region $REGION --query 'Parameters[0].Value' --output text)
KEY_NAME="${PROJECT_NAME}-ec2-key-${ENVIRONMENT}"
SECURITY_GROUP_NAME="${PROJECT_NAME}-sg-ec2-${ENVIRONMENT}"
INSTANCE_PROFILE_NAME="${PROJECT_NAME}-ec2-instance-profile-${ENVIRONMENT}"
INSTANCE_ROLE_NAME="${PROJECT_NAME}-ec2-role-${ENVIRONMENT}"
TAG_NAME="${PROJECT_NAME}-instance-${ENVIRONMENT}"

echo "🚀 Starting FixFox Development EC2 Deployment"
echo "Region: $REGION"
echo "ECR Repository: $ECR_REPO_URL"
echo ""

# --- IAM Role and Instance Profile for ECR Access ---
echo "👤 Creating IAM Role and Instance Profile for ECR access..."

# Create the role
aws iam create-role \
  --role-name "$INSTANCE_ROLE_NAME" \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }]
  }' \
  --description "Allows EC2 instance to access ECR" \
  2>/dev/null || echo "IAM Role '$INSTANCE_ROLE_NAME' already exists."

# Attach the ECR read-only policy
aws iam attach-role-policy \
  --role-name "$INSTANCE_ROLE_NAME" \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly

# Create the instance profile
aws iam create-instance-profile \
  --instance-profile-name "$INSTANCE_PROFILE_NAME" \
  2>/dev/null || echo "Instance Profile '$INSTANCE_PROFILE_NAME' already exists."

# Add the role to the instance profile
aws iam add-role-to-instance-profile \
  --instance-profile-name "$INSTANCE_PROFILE_NAME" \
  --role-name "$INSTANCE_ROLE_NAME"

echo "✅ IAM setup complete."
echo ""
sleep 5 # Allow time for IAM changes to propagate

# --- Security Group ---
echo "🌐 Creating Security Group..."
SECURITY_GROUP_ID=$(aws ec2 describe-security-groups --group-names "$SECURITY_GROUP_NAME" --query "SecurityGroups[0].GroupId" --output text 2>/dev/null)
if [ -z "$SECURITY_GROUP_ID" ]; then
  VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query "Vpcs[0].VpcId" --output text)
  SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name "$SECURITY_GROUP_NAME" \
    --description "Allow SSH and App traffic for FixFox Dev" \
    --vpc-id "$VPC_ID" \
    --output text \
    --query 'GroupId')

  # Allow SSH and App traffic
  aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP_ID" --protocol tcp --port 22 --cidr 0.0.0.0/0
  aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP_ID" --protocol tcp --port 3000 --cidr 0.0.0.0/0
  echo "Security Group '$SECURITY_GROUP_NAME' created."
else
  echo "Security Group '$SECURITY_GROUP_NAME' already exists."
fi
echo "✅ Security Group setup complete."
echo ""

# --- EC2 Key Pair ---
echo "🔑 Checking for EC2 Key Pair..."
if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" >/dev/null 2>&1; then
  echo "Creating new EC2 Key Pair: $KEY_NAME and storing it in ~/.ssh/${KEY_NAME}.pem"
  aws ec2 create-key-pair --key-name "$KEY_NAME" --query 'KeyMaterial' --output text > ~/.ssh/${KEY_NAME}.pem
  chmod 400 ~/.ssh/${KEY_NAME}.pem
else
  echo "Key Pair '$KEY_NAME' already exists."
fi
echo "✅ Key Pair setup complete."
echo ""

# --- Build and Push Docker Image ---
echo "📦 Building and pushing Docker image to ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPO_URL
docker build -t $ECR_REPO_NAME:$IMAGE_TAG -f server/Dockerfile .
docker tag $ECR_REPO_NAME:$IMAGE_TAG $ECR_REPO_URL:$IMAGE_TAG
docker push $ECR_REPO_URL:$IMAGE_TAG
echo "✅ Docker image pushed."
echo ""

# --- EC2 User Data Script ---
cat > user-data.sh <<'EOF'
#!/bin/bash
yum update -y
yum install -y docker git
service docker start
usermod -a -G docker ec2-user
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip
EOF

# --- Launch or Identify EC2 Instance ---
echo "🚀 Launching or identifying EC2 instance..."
INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=$TAG_NAME" "Name=instance-state-name,Values=running" --query "Reservations[].Instances[0].InstanceId" --output text)
if [ "$INSTANCE_ID" == "None" ]; then
  INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "$AMI_ID" \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$SECURITY_GROUP_ID" \
    --iam-instance-profile Name="$INSTANCE_PROFILE_NAME" \
    --user-data file://user-data.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$TAG_NAME}]" \
    --query 'Instances[0].InstanceId' \
    --output text)
  echo "Instance launching with ID: $INSTANCE_ID. Waiting for it to run..."
  aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"
else
  echo "Running instance found: $INSTANCE_ID"
fi
PUBLIC_IP=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
rm user-data.sh

# --- Create Deployment Package ---
echo "📦 Creating deployment package..."
mkdir -p deployment
# Create the .env file with the correct variables and credentials
cat > deployment/.env <<EOF
# --- Server Environment Variables ---
DATABASE_HOST=fixfoxdb.cb8aywmkgppq.us-west-2.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_USER=idanaim
DATABASE_PASSWORD=In16051982
DATABASE_NAME=fixfoxdb
JWT_SECRET=your-strong-jwt-secret
# Add other required environment variables
EOF
cp server/docker-compose.yml deployment/
echo "✅ Deployment package created."
echo ""

# --- Deploy to EC2 ---
echo "🚀 Deploying to EC2 instance at $PUBLIC_IP..."
SSH_KEY_PATH=~/.ssh/${KEY_NAME}.pem
# Wait for SSH to be available
while ! ssh -i $SSH_KEY_PATH -o "StrictHostKeyChecking=no" -o "ConnectionAttempts=10" ec2-user@$PUBLIC_IP "echo 'SSH connection established'"; do
    echo "Waiting for SSH connection..."
    sleep 10
done
# Copy deployment files
scp -i $SSH_KEY_PATH -o "StrictHostKeyChecking=no" -r deployment/* ec2-user@$PUBLIC_IP:~/
# SSH and run docker-compose
ssh -i $SSH_KEY_PATH -o "StrictHostKeyChecking=no" ec2-user@$PUBLIC_IP <<EOF
  aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPO_URL
  docker pull $ECR_REPO_URL:$IMAGE_TAG
  docker-compose up -d
EOF
rm -rf deployment

# --- Final Output ---
echo ""
echo "✅🎉 Deployment Complete!"
echo ""
echo "Public IP Address: $PUBLIC_IP"
echo "API Endpoint: http://${PUBLIC_IP}:3000/api"
echo "SSH Command: ssh -i $SSH_KEY_PATH ec2-user@${PUBLIC_IP}"
echo ""
echo "Server is running in detached mode. To see logs, run:"
echo "ssh -i $SSH_KEY_PATH ec2-user@$PUBLIC_IP 'docker-compose logs -f'" 
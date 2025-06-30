#!/bin/bash

set -e

# ==============================================================================
#
#  FixFox Development EC2 Deployment Script
#
#  This script provisions a single t2.micro EC2 instance and configures it
#  to run the FixFox server application using Docker and Docker Compose.
#  It is designed to be a cost-effective alternative to ECS/Fargate for
#  development environments, leveraging the AWS Free Tier.
#
#  Prerequisites:
#  - AWS CLI installed and configured.
#  - An ECR repository named 'fixfox-api' must exist.
#
#  What it does:
#  1. Creates an IAM Role and Instance Profile for ECR access.
#  2. Creates a Security Group to allow SSH (22) and App (3000) traffic.
#  3. Launches a t2.micro EC2 instance with the latest Amazon Linux 2 AMI.
#  4. Uses EC2 User Data to install Docker & Docker Compose on boot.
#  5. Outputs the Public IP of the instance for connection.
#
# ==============================================================================

# --- Configuration ---
REGION="us-west-2"
PROJECT_NAME="fixfox"
ENVIRONMENT="dev"
INSTANCE_TYPE="t2.micro" # Free-tier eligible
ECR_REPO_NAME="${PROJECT_NAME}-api"

# Use the latest Amazon Linux 2 AMI for the region
AMI_ID=$(aws ssm get-parameters --names /aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2 --region $REGION --query 'Parameters[0].Value' --output text)
KEY_NAME="${PROJECT_NAME}-ec2-key-${ENVIRONMENT}"
SECURITY_GROUP_NAME="${PROJECT_NAME}-sg-ec2-${ENVIRONMENT}"
INSTANCE_PROFILE_NAME="${PROJECT_NAME}-ec2-instance-profile-${ENVIRONMENT}"
INSTANCE_ROLE_NAME="${PROJECT_NAME}-ec2-role-${ENVIRONMENT}"

echo "🚀 Starting FixFox Development EC2 Setup"
echo "Region: $REGION"
echo "Instance Type: $INSTANCE_TYPE"
echo "AMI ID: $AMI_ID"
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
if ! aws ec2 describe-security-groups --group-names "$SECURITY_GROUP_NAME" >/dev/null 2>&1; then
  SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name "$SECURITY_GROUP_NAME" \
    --description "Allow SSH and App traffic for FixFox Dev" \
    --vpc-id $(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query "Vpcs[0].VpcId" --output text) \
    --output text \
    --query 'GroupId')

  # Allow SSH from anywhere (for development convenience)
  aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

  # Allow app traffic from anywhere
  aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0
  echo "Security Group '$SECURITY_GROUP_NAME' created and configured."
else
  echo "Security Group '$SECURITY_GROUP_NAME' already exists."
fi
echo "✅ Security Group setup complete."
echo ""

# --- EC2 Key Pair ---
echo "🔑 Checking for EC2 Key Pair..."
if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" >/dev/null 2>&1; then
  echo "Creating new EC2 Key Pair: $KEY_NAME"
  echo "IMPORTANT: Storing the private key in ~/.ssh/${KEY_NAME}.pem"
  aws ec2 create-key-pair \
    --key-name "$KEY_NAME" \
    --query 'KeyMaterial' \
    --output text > ~/.ssh/${KEY_NAME}.pem
  chmod 400 ~/.ssh/${KEY_NAME}.pem
else
  echo "Key Pair '$KEY_NAME' already exists."
fi
echo "✅ Key Pair setup complete."
echo ""

# --- EC2 User Data Script ---
# This script runs on the instance the first time it boots.
# It installs Docker, Docker Compose, and the AWS CLI.
cat > user-data.sh <<'EOF'
#!/bin/bash
yum update -y
yum install -y docker git
service docker start
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip
EOF

# --- Launch EC2 Instance ---
echo "🚀 Launching EC2 instance... (This may take a moment)"
if ! aws ec2 describe-instances --filters "Name=tag:Name,Values=${PROJECT_NAME}-instance-${ENVIRONMENT}" "Name=instance-state-name,Values=running" --query "Reservations[].Instances[]" --output text | grep -q .; then
  INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "$AMI_ID" \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --security-group-ids $(aws ec2 describe-security-groups --group-names "$SECURITY_GROUP_NAME" --query "SecurityGroups[0].GroupId" --output text) \
    --iam-instance-profile Name="$INSTANCE_PROFILE_NAME" \
    --user-data file://user-data.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=${PROJECT_NAME}-instance-${ENVIRONMENT}}]" \
    --query 'Instances[0].InstanceId' \
    --output text)

  echo "Instance is launching with ID: $INSTANCE_ID"
  echo "Waiting for instance to be in 'running' state..."
  aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"

  PUBLIC_IP=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
else
  echo "Instance already running."
  PUBLIC_IP=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=${PROJECT_NAME}-instance-${ENVIRONMENT}" "Name=instance-state-name,Values=running" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
fi

rm user-data.sh

# --- Final Output ---
echo ""
echo "✅🎉 EC2 Instance is running!"
echo ""
echo "Public IP Address: $PUBLIC_IP"
echo "SSH Command: ssh -i ~/.ssh/${KEY_NAME}.pem ec2-user@${PUBLIC_IP}"
echo ""
echo "Next steps:"
echo "1. Wait a couple of minutes for Docker to install."
echo "2. SSH into the instance using the command above."
echo "3. Clone your repository and deploy the application."
echo "   (You will need to create a docker-compose.yml and .env file on the server)" 
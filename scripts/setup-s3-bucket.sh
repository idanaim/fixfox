#!/bin/bash

# FixFox S3 Bucket Setup Script
# This script creates and configures the S3 bucket for file storage

BUCKET_NAME="fixfox-files"
REGION="us-west-2"

echo "Setting up S3 bucket: $BUCKET_NAME in region: $REGION"

# Create the bucket
echo "Creating S3 bucket..."
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Create bucket folders
echo "Creating folder structure..."
aws s3api put-object --bucket $BUCKET_NAME --key equipment/images/ --region $REGION
aws s3api put-object --bucket $BUCKET_NAME --key users/avatars/ --region $REGION
aws s3api put-object --bucket $BUCKET_NAME --key issues/attachments/ --region $REGION
aws s3api put-object --bucket $BUCKET_NAME --key equipment/manuals/ --region $REGION

# Set up CORS configuration
echo "Configuring CORS..."
cat > cors-config.json << EOF
{
    "CORSRules": [
        {
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://cors-config.json --region $REGION

# Set up bucket policy for public read access to certain folders
echo "Setting up bucket policy..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME/equipment/images/*",
                "arn:aws:s3:::$BUCKET_NAME/users/avatars/*"
            ]
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json --region $REGION

# Clean up temporary files
rm cors-config.json bucket-policy.json

echo "S3 bucket setup completed successfully!"
echo "Bucket URL: https://$BUCKET_NAME.s3.$REGION.amazonaws.com"
echo ""
echo "Environment variables to set:"
echo "AWS_S3_BUCKET_NAME=$BUCKET_NAME"
echo "AWS_REGION=$REGION" 
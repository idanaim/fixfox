#!/bin/bash

# FixFox Elastic Beanstalk Setup Script
# This script creates the Elastic Beanstalk application and environment

APPLICATION_NAME="fixfox-api"
ENVIRONMENT_NAME="fixfox-api-prod"
REGION="us-west-2"
PLATFORM="64bit Amazon Linux 2023 v6.1.7 running Node.js 18"
SOLUTION_STACK="64bit Amazon Linux 2023 v6.1.7 running Node.js 18"

echo "Setting up Elastic Beanstalk application: $APPLICATION_NAME in region: $REGION"

# Create the application
echo "Creating Elastic Beanstalk application..."
aws elasticbeanstalk create-application \
    --application-name $APPLICATION_NAME \
    --description "FixFox Equipment Maintenance REST API Server" \
    --region $REGION

# Wait a moment for the application to be created
sleep 5

# Create the environment
echo "Creating Elastic Beanstalk environment..."
aws elasticbeanstalk create-environment \
    --application-name $APPLICATION_NAME \
    --environment-name $ENVIRONMENT_NAME \
    --description "Production environment for FixFox API" \
    --solution-stack-name "$SOLUTION_STACK" \
    --option-settings \
        Namespace=aws:autoscaling:launchconfiguration,OptionName=InstanceType,Value=t3.micro \
        Namespace=aws:elasticbeanstalk:environment,OptionName=EnvironmentType,Value=SingleInstance \
        Namespace=aws:elasticbeanstalk:application:environment,OptionName=NODE_ENV,Value=production \
        Namespace=aws:elasticbeanstalk:application:environment,OptionName=PORT,Value=3000 \
        Namespace=aws:elasticbeanstalk:healthreporting:system,OptionName=SystemType,Value=enhanced \
    --region $REGION

echo "Waiting for environment to be ready (this may take several minutes)..."
aws elasticbeanstalk wait environment-exists \
    --application-name $APPLICATION_NAME \
    --environment-names $ENVIRONMENT_NAME \
    --region $REGION

echo "Checking environment status..."
aws elasticbeanstalk describe-environments \
    --application-name $APPLICATION_NAME \
    --environment-names $ENVIRONMENT_NAME \
    --region $REGION \
    --query 'Environments[0].{Status:Status,Health:Health,URL:CNAME}'

echo ""
echo "✅ Elastic Beanstalk setup completed!"
echo "Application: $APPLICATION_NAME"
echo "Environment: $ENVIRONMENT_NAME"
echo "Region: $REGION"
echo ""
echo "You can now deploy your application using the GitHub Actions workflow."
echo "The environment URL will be available once the first deployment is complete." 
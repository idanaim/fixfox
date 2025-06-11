#!/bin/bash

APPLICATION_NAME="fixfox-api"
ENVIRONMENT_NAME="fixfox-api-env"
REGION="us-west-2"

echo "Checking Elastic Beanstalk environment status..."
echo "Application: $APPLICATION_NAME"
echo "Environment: $ENVIRONMENT_NAME"
echo "Region: $REGION"
echo ""

# Check if environment exists and get its status
ENV_STATUS=$(aws elasticbeanstalk describe-environments \
    --application-name $APPLICATION_NAME \
    --environment-names $ENVIRONMENT_NAME \
    --region $REGION \
    --query 'Environments[0].{Status:Status,Health:Health,URL:CNAME}' \
    --output table 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "Environment Status:"
    echo "$ENV_STATUS"
    
    # Check if environment is ready
    STATUS=$(aws elasticbeanstalk describe-environments \
        --application-name $APPLICATION_NAME \
        --environment-names $ENVIRONMENT_NAME \
        --region $REGION \
        --query 'Environments[0].Status' \
        --output text 2>/dev/null)
    
    if [ "$STATUS" = "Ready" ]; then
        echo ""
        echo "✅ Environment is ready for deployment!"
        
        # Get the environment URL
        URL=$(aws elasticbeanstalk describe-environments \
            --application-name $APPLICATION_NAME \
            --environment-names $ENVIRONMENT_NAME \
            --region $REGION \
            --query 'Environments[0].CNAME' \
            --output text 2>/dev/null)
        
        if [ "$URL" != "None" ] && [ "$URL" != "" ]; then
            echo "🌐 Environment URL: http://$URL"
        fi
    elif [ "$STATUS" = "Launching" ]; then
        echo ""
        echo "⏳ Environment is still being created. Please wait..."
    elif [ "$STATUS" = "Terminated" ]; then
        echo ""
        echo "❌ Environment was terminated. You may need to create a new one."
    else
        echo ""
        echo "ℹ️  Environment status: $STATUS"
    fi
else
    echo "❌ Environment not found or error occurred."
    echo "You may need to create the environment first."
fi 
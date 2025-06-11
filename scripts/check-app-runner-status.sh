#!/bin/bash

SERVICE_NAME="fixfox-api"
REGION="us-west-2"

echo "Checking AWS App Runner service status..."
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Get service ARN
SERVICE_ARN=$(aws apprunner list-services \
    --region $REGION \
    --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" \
    --output text 2>/dev/null)

if [ -z "$SERVICE_ARN" ] || [ "$SERVICE_ARN" = "None" ]; then
    echo "❌ App Runner service '$SERVICE_NAME' not found."
    echo ""
    echo "To create the service:"
    echo "1. Follow the guide: scripts/app-runner-setup-guide.md"
    echo "2. Or go to: https://console.aws.amazon.com/apprunner/"
    exit 1
fi

echo "✅ Service found: $SERVICE_NAME"
echo "ARN: $SERVICE_ARN"
echo ""

# Get service details
SERVICE_INFO=$(aws apprunner describe-service \
    --service-arn "$SERVICE_ARN" \
    --region $REGION \
    --query 'Service.{Status:Status,ServiceUrl:ServiceUrl,CreatedAt:CreatedAt,UpdatedAt:UpdatedAt}' \
    --output table 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "Service Details:"
    echo "$SERVICE_INFO"
    
    # Get just the status
    STATUS=$(aws apprunner describe-service \
        --service-arn "$SERVICE_ARN" \
        --region $REGION \
        --query 'Service.Status' \
        --output text 2>/dev/null)
    
    # Get service URL
    SERVICE_URL=$(aws apprunner describe-service \
        --service-arn "$SERVICE_ARN" \
        --region $REGION \
        --query 'Service.ServiceUrl' \
        --output text 2>/dev/null)
    
    echo ""
    case $STATUS in
        "RUNNING")
            echo "🟢 Status: Service is running and healthy!"
            echo "🌐 Service URL: https://$SERVICE_URL"
            echo "🏥 Health Check: https://$SERVICE_URL/api/health"
            echo ""
            echo "Testing health endpoint..."
            curl -s "https://$SERVICE_URL/api/health" && echo "" || echo "❌ Health check failed"
            ;;
        "CREATE_FAILED")
            echo "❌ Status: Service creation failed"
            echo "Check the App Runner console for error details"
            ;;
        "OPERATION_IN_PROGRESS")
            echo "⏳ Status: Deployment in progress..."
            echo "This usually takes 3-5 minutes"
            ;;
        "PAUSED")
            echo "⏸️  Status: Service is paused"
            echo "Resume the service in the App Runner console"
            ;;
        *)
            echo "ℹ️  Status: $STATUS"
            ;;
    esac
else
    echo "❌ Failed to get service details"
fi

echo ""
echo "🔗 App Runner Console: https://console.aws.amazon.com/apprunner/" 
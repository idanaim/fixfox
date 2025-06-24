#!/bin/bash

set -e

echo "🚀 FixFox Mobile App - API URL Updater"
echo "======================================"

# Check if URL parameter is provided
if [ -z "$1" ]; then
  echo "❌ Please provide the ECS API URL"
  echo ""
  echo "Usage: $0 <ECS_API_URL>"
  echo ""
  echo "Examples:"
  echo "  $0 http://fixfox-lb-123456789.us-west-2.elb.amazonaws.com"
  echo "  $0 https://api.yourdomain.com"
  echo ""
  echo "💡 To get your ECS URL, run: ../scripts/get-api-url.sh prod"
  exit 1
fi

API_URL="$1"

# Remove trailing slash if present
API_URL="${API_URL%/}"

echo "🔧 Updating API configuration..."
echo "New API URL: $API_URL"

# Update the config.ts file
sed -i.bak "s|const DEPLOYED_API_URL = '.*';|const DEPLOYED_API_URL = '$API_URL/api';|" src/config.ts

# Remove backup file
rm -f src/config.ts.bak

echo "✅ API URL updated successfully!"
echo ""
echo "📱 Current configuration:"
echo "  Local API: http://localhost:3000/api"
echo "  Deployed API: $API_URL/api"
echo "  Using: DEPLOYED API (useLocalAPI = false)"
echo ""
echo "🔄 To switch back to local API, edit src/config.ts and set:"
echo "  const useLocalAPI = true;"
echo ""
echo "🚀 Ready to test with your deployed API!" 
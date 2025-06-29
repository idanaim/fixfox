#!/bin/bash

# Helper script to set environment for FixFox mobile app
# Usage: ./scripts/set-env.sh [local|production|staging]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

ENV_TYPE=${1:-local}

echo "🔧 Setting environment to: $ENV_TYPE"

case $ENV_TYPE in
  local)
    echo "📱 Configuring for LOCAL development..."
    export EXPO_PUBLIC_API_ENV=local
    export EXPO_PUBLIC_USE_LOCAL_API=true
    export EXPO_PUBLIC_LOCAL_API_URL=http://10.0.2.2:3000/api
    export EXPO_PUBLIC_DEBUG_API=true
    ;;
  
  production)
    echo "🚀 Configuring for PRODUCTION..."
    export EXPO_PUBLIC_API_ENV=production
    export EXPO_PUBLIC_USE_LOCAL_API=false
    export EXPO_PUBLIC_DEPLOYED_API_URL=http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api
    export EXPO_PUBLIC_DEBUG_API=false
    ;;
  
  staging)
    echo "🧪 Configuring for STAGING..."
    export EXPO_PUBLIC_API_ENV=staging  
    export EXPO_PUBLIC_USE_LOCAL_API=false
    export EXPO_PUBLIC_DEPLOYED_API_URL=http://fixfox-staging-alb.us-west-2.elb.amazonaws.com/api
    export EXPO_PUBLIC_DEBUG_API=true
    ;;
    
  *)
    echo "❌ Invalid environment: $ENV_TYPE"
    echo "Usage: $0 [local|production|staging]"
    exit 1
    ;;
esac

echo "✅ Environment variables set:"
echo "   EXPO_PUBLIC_API_ENV=$EXPO_PUBLIC_API_ENV"
echo "   EXPO_PUBLIC_USE_LOCAL_API=$EXPO_PUBLIC_USE_LOCAL_API"
echo "   EXPO_PUBLIC_DEBUG_API=$EXPO_PUBLIC_DEBUG_API"

if [ "$ENV_TYPE" = "local" ]; then
  echo "   EXPO_PUBLIC_LOCAL_API_URL=$EXPO_PUBLIC_LOCAL_API_URL"
else
  echo "   EXPO_PUBLIC_DEPLOYED_API_URL=$EXPO_PUBLIC_DEPLOYED_API_URL"
fi

echo ""
echo "🚀 Now run: npx expo start"
echo "   Or use: source ./scripts/set-env.sh $ENV_TYPE && npx expo start" 
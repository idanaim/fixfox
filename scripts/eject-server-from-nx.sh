#!/bin/bash

set -e

echo "🚀 Ejecting Node.js Server from NX Workspace"
echo "============================================="
echo ""
echo "This will:"
echo "1. Create a standalone server directory outside NX"
echo "2. Copy all server code and dependencies"
echo "3. Set up independent package.json with Node 20"
echo "4. Update build scripts and Docker"
echo "5. Keep Expo app in NX workspace"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Create new server directory
echo "📁 Step 1: Creating standalone server directory..."
mkdir -p server
cd server

# Copy server source code
echo "📋 Step 2: Copying server source code..."
cp -r ../apps/rest-man-server/src .
cp ../apps/rest-man-server/tsconfig.app.json ./tsconfig.json
cp ../apps/rest-man-server/tsconfig.spec.json ./tsconfig.spec.json || true
cp ../apps/rest-man-server/jest.config.ts ./jest.config.ts || true
cp ../apps/rest-man-server/typeorm.config.js .

# Create new package.json for standalone server
echo "📦 Step 3: Creating standalone package.json..."
cat > package.json << 'EOF'
{
  "name": "fixfox-server",
  "version": "1.0.0",
  "description": "FixFox Equipment Maintenance REST API Server - Standalone",
  "main": "dist/main.js",
  "scripts": {
    "build": "nest build",
    "start": "node dist/main.js",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm migration:generate -- -d ./typeorm.config.js",
    "migration:run": "npm run typeorm migration:run -- -d ./typeorm.config.js",
    "migration:revert": "npm run typeorm migration:revert -- -d ./typeorm.config.js"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.826.0",
    "@aws-sdk/s3-request-presigner": "^3.826.0",
    "@nestjs/common": "^10.0.2",
    "@nestjs/config": "^4.0.0",
    "@nestjs/core": "^10.0.2",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/mapped-types": "^2.1.0",
    "@nestjs/passport": "^11.0.5",
    "@nestjs/platform-express": "^10.0.2",
    "@nestjs/typeorm": "^11.0.0",
    "@types/multer": "^1.4.13",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.2",
    "multer": "^2.0.1",
    "openai": "^4.92.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "pg": "^8.13.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0",
    "typeorm": "^0.3.20",
    "uuid": "^11.0.5"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.1",
    "@nestjs/testing": "^10.0.2",
    "@types/bcrypt": "^5.0.2",
    "@types/jest": "^29.5.12",
    "@types/node": "~20.12.0",
    "@types/passport-jwt": "^4.0.1",
    "@types/supertest": "^6.0.0",
    "jest": "^29.7.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "~5.6.2"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
EOF

# Create nest-cli.json
echo "⚙️ Step 4: Creating NestJS configuration..."
cat > nest-cli.json << 'EOF'
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
EOF

# Update tsconfig.json for standalone
echo "🔧 Step 5: Updating TypeScript configuration..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
EOF

# Copy test configuration if exists
if [ -f "../apps/rest-man-server/test" ]; then
    cp -r ../apps/rest-man-server/test .
fi

cd ..

# Update main Dockerfile to use standalone server
echo "🐳 Step 6: Updating Dockerfile for standalone server..."
cat > Dockerfile << 'EOF'
# FixFox Server Dockerfile - Standalone
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY server/ .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package.json and install production dependencies
COPY server/package*.json ./
RUN npm ci --production

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
EOF

# Update deployment scripts
echo "🚀 Step 7: Updating deployment scripts..."

# Update emergency deploy script
cat > scripts/emergency-deploy-standalone.sh << 'EOF'
#!/bin/bash

set -e

echo "🚨 Emergency Deployment - Standalone Server"
echo "==========================================="
echo ""

# Configuration
REGION="us-west-2"
ACCOUNT_ID="993512230158"
ECR_REPO="fixfox-api"
CLUSTER="fixfox-prod"
SERVICE="fixfox-api-prod"
TASK_DEF="fixfox-api-prod"

# Build the application
echo "🔨 Step 1: Building Docker image..."
docker build -t $ECR_REPO:latest .

# Login to ECR
echo "🔐 Step 2: Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Tag and push image
echo "📤 Step 3: Pushing image to ECR..."
docker tag $ECR_REPO:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest

# Create new task definition with real image
echo "📋 Step 4: Creating new task definition..."
cat > task-definition-real.json << EOFTASK
{
  "family": "$TASK_DEF",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/fixfox-task-execution-role-prod",
  "taskRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/fixfox-task-role-prod",
  "containerDefinitions": [
    {
      "name": "fixfox-api",
      "image": "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$TASK_DEF",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        },
        {
          "name": "OPENAI_API_KEY",
          "value": "dummy-key-for-demo"
        },
        {
          "name": "DB_HOST",
          "value": "fixfoxdb.cb8aywmkgppq.us-west-2.rds.amazonaws.com"
        },
        {
          "name": "DB_PORT",
          "value": "5432"
        },
        {
          "name": "DB_USERNAME",
          "value": "idanaim"
        },
        {
          "name": "DB_PASSWORD",
          "value": "In16051982"
        },
        {
          "name": "DB_DATABASE",
          "value": "fixfoxdb"
        }
      ]
    }
  ]
}
EOFTASK

# Register new task definition
echo "📝 Step 5: Registering new task definition..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file://task-definition-real.json \
  --region $REGION \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "New task definition: $NEW_TASK_DEF_ARN"

# Update service
echo "🚀 Step 6: Updating ECS service..."
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --task-definition "$NEW_TASK_DEF_ARN" \
  --region $REGION

# Wait for deployment
echo "⏳ Step 7: Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster $CLUSTER \
  --services $SERVICE \
  --region $REGION

# Clean up
rm -f task-definition-real.json

echo ""
echo "✅ Emergency deployment complete!"
echo ""
echo "🔍 Testing health endpoint..."
sleep 30  # Give it time to start

# Test health check
ALB_DNS="fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com"
HEALTH_URL="http://$ALB_DNS/api/health"

echo "Testing: $HEALTH_URL"
for i in {1..5}; do
  echo "Attempt $i/5..."
  if curl -f -m 10 "$HEALTH_URL"; then
    echo ""
    echo "🎉 Health check successful!"
    exit 0
  else
    echo "Failed, waiting 30 seconds..."
    sleep 30
  fi
done

echo ""
echo "⚠️  Health check still failing, but deployment is complete."
echo "Check the logs and target group health in AWS console."
EOF

chmod +x scripts/emergency-deploy-standalone.sh

# Update root package.json scripts
echo "📝 Step 8: Updating root package.json scripts..."
# Create a backup first
cp package.json package.json.backup

# Update scripts to point to standalone server
cat > temp_package.json << 'EOF'
{
  "name": "fixfox",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    "build": "cd server && npm run build",
    "ui-native": "nx serve rest-man-native",
    "serve": "cd server && npm run start:dev",
    "start": "cd server && npm run start:prod",
    "server:install": "cd server && npm install",
    "server:build": "cd server && npm run build",
    "server:start": "cd server && npm start",
    "server:dev": "cd server && npm run start:dev",
    "typeorm": "cd server && npm run typeorm",
    "migration:generate": "cd server && npm run migration:generate",
    "migration:run": "cd server && npm run migration:run",
    "migration:revert": "cd server && npm run migration:revert"
  },
  "private": true,
  "dependencies": {
    "@expo/metro-config": "~0.18.1",
    "@expo/metro-runtime": "~3.2.1",
    "@expo/vector-icons": "^14.0.4",
    "@react-native-async-storage/async-storage": "^2.1.1",
    "@react-native-community/progress-bar-android": "^1.0.5",
    "@react-native-google-signin/google-signin": "^13.1.0",
    "@react-native-picker/picker": "^2.10.2",
    "@react-navigation/native": "^7.0.14",
    "@react-navigation/native-stack": "^7.2.0",
    "@react-navigation/stack": "^7.1.1",
    "@tanstack/react-query": "^5.70.0",
    "axios": "^1.6.0",
    "expo": "~51.0.8",
    "expo-image-picker": "^16.0.6",
    "expo-linear-gradient": "^14.0.2",
    "expo-secure-store": "^14.0.1",
    "expo-splash-screen": "~0.27.4",
    "expo-status-bar": "~1.12.1",
    "i18next": "^25.1.3",
    "i18next-browser-languagedetector": "^8.1.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-hook-form": "^7.54.0",
    "react-i18next": "^15.5.1",
    "react-native": "0.74.1",
    "react-native-fs": "^2.20.0",
    "react-native-gesture-handler": "^2.22.0",
    "react-native-localize": "^3.4.1",
    "react-native-markdown-display": "^7.0.2",
    "react-native-paper": "^5.13.1",
    "react-native-reanimated": "^3.16.7",
    "react-native-safe-area-context": "^5.1.0",
    "react-native-screens": "^4.5.0",
    "react-native-sqlite-storage": "^6.0.1",
    "react-native-svg": "^15.11.1",
    "react-native-svg-transformer": "1.3.0",
    "react-native-vector-icons": "^10.2.0",
    "react-native-web": "~0.19.11",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.8.0",
    "@expo/cli": "~0.18.13",
    "@nx/eslint": "20.2.1",
    "@nx/eslint-plugin": "20.2.1",
    "@nx/expo": "^20.2.1",
    "@nx/jest": "20.2.1",
    "@nx/react": "^20.2.1",
    "@nx/workspace": "20.2.1",
    "@testing-library/jest-native": "~5.4.3",
    "@testing-library/react-native": "~12.5.0",
    "@types/jest": "^29.5.12",
    "@types/react": "~18.2.45",
    "@types/react-native-sqlite-storage": "^6.0.5",
    "babel-preset-expo": "~11.0.0",
    "eslint": "^9.8.0",
    "eslint-config-prettier": "^9.0.0",
    "jest": "^29.7.0",
    "jest-expo": "~51.0.2",
    "nx": "20.2.1",
    "prettier": "^2.6.2",
    "react-test-renderer": "18.2.0",
    "tslib": "^2.3.0",
    "typescript": "~5.6.2",
    "typescript-eslint": "^8.13.0"
  }
}
EOF

mv temp_package.json package.json

# Update NX configuration to remove server
echo "🔧 Step 9: Updating NX configuration..."
# Remove webpack plugin and server-specific configurations
cat > nx.json << 'EOF'
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/.eslintrc.json",
      "!{projectRoot}/eslint.config.js",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json",
      "!{projectRoot}/jest.config.[jt]s",
      "!{projectRoot}/src/test-setup.[jt]s",
      "!{projectRoot}/test-setup.[jt]s"
    ],
    "sharedGlobals": ["{workspaceRoot}/.github/workflows/ci.yml"]
  },
  "nxCloudId": "6755468f5e23017d7f3ec0cf",
  "plugins": [
    {
      "plugin": "@nx/eslint/plugin",
      "options": {
        "targetName": "lint"
      }
    },
    {
      "plugin": "@nx/jest/plugin",
      "options": {
        "targetName": "test"
      }
    },
    {
      "plugin": "@nx/expo/plugin",
      "options": {
        "startTargetName": "start",
        "buildTargetName": "build",
        "prebuildTargetName": "prebuild",
        "serveTargetName": "serve",
        "installTargetName": "install",
        "exportTargetName": "export",
        "submitTargetName": "submit",
        "runIosTargetName": "run-ios",
        "runAndroidTargetName": "run-android"
      }
    }
  ],
  "useLegacyCache": true,
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "e2e"]
      }
    }
  }
}
EOF

echo ""
echo "✅ Server ejection complete!"
echo ""
echo "📁 Structure:"
echo "  ├── server/          - Standalone Node.js 20 server"
echo "  ├── apps/"
echo "  │   └── rest-man-native/  - Expo app (still in NX)"
echo "  └── scripts/"
echo "      └── emergency-deploy-standalone.sh"
echo ""
echo "🚀 Next steps:"
echo "1. cd server && npm install"
echo "2. cd server && npm run build"
echo "3. Test: cd server && npm run start:dev"
echo "4. Deploy: ./scripts/emergency-deploy-standalone.sh"
echo ""
echo "📱 Expo app remains in NX workspace and can still use:"
echo "  - nx serve rest-man-native"
echo "  - nx build rest-man-native"
echo "" 
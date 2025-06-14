#!/bin/bash

echo "🌿 Creating dev branch for FixFox"
echo "================================"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if dev branch already exists
if git show-ref --verify --quiet refs/heads/dev; then
    echo "✅ Dev branch already exists locally"
    
    # Check if it exists on remote
    if git ls-remote --heads origin dev | grep -q dev; then
        echo "✅ Dev branch already exists on remote"
        echo ""
        echo "🎯 You're all set! You can now:"
        echo "1. Switch to dev: git checkout dev"
        echo "2. Deploy to dev: ./scripts/deploy-dev.sh"
        exit 0
    else
        echo "📤 Pushing existing dev branch to remote..."
        git push -u origin dev
        echo "✅ Dev branch pushed to remote"
        exit 0
    fi
fi

# Create dev branch from current branch
echo ""
echo "🔄 Creating dev branch from $CURRENT_BRANCH..."

# Make sure we're up to date
echo "📥 Pulling latest changes..."
git pull origin $CURRENT_BRANCH

# Create and switch to dev branch
git checkout -b dev

echo "✅ Dev branch created locally"

# Push to remote
echo "📤 Pushing dev branch to remote..."
git push -u origin dev

echo ""
echo "🎉 Dev branch setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Authorize GitHub in AWS Console (if not done yet)"
echo "2. Create development environment: ./scripts/setup-app-runner-dev.sh"
echo "3. Create production environment: ./scripts/setup-app-runner-prod.sh"
echo "4. Deploy to development: ./scripts/deploy-dev.sh"
echo ""
echo "🌿 Branch strategy:"
echo "• dev branch → Development environment"
echo "• main branch → Production environment" 
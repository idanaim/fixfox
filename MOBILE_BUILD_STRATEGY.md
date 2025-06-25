# 📱 Mobile APK/SDK Build Strategy Guide

## 🎯 **Recommended Build Strategy: Hybrid Approach**

### **🔄 1. Automated CI/CD Builds**

#### **Automatic Triggers:**
- ✅ **Push to `main`** → Production build
- ✅ **Pull Request** → Preview build  
- ✅ **Manual Dispatch** → Any build type

#### **How it works:**
```bash
# Automatic on push to main
git push origin main  # → Triggers production build

# Automatic on PR
gh pr create  # → Triggers preview build

# Manual trigger via GitHub UI
# Go to: Actions → Mobile App CI/CD → Run workflow
```

### **🎯 2. On-Demand Builds**

#### **GitHub Actions (Recommended)**
```bash
# Via GitHub UI:
# 1. Go to: Actions → 📱 Build APK On-Demand
# 2. Click "Run workflow"
# 3. Select: Profile, Platform, Message
# 4. Click "Run workflow"
```

#### **Local Command Line**
```bash
cd mobile-app

# Quick preview APK
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production

# Development build
eas build --platform android --profile development
```

## 🏗️ **Build Profiles Explained**

### **Preview Profile** (Recommended for testing)
- ✅ **Fast builds** (~15 minutes)
- ✅ **APK format** (easy to install)
- ✅ **Internal distribution**
- ✅ **Perfect for testing**

### **Production Profile** (App Store ready)
- ⏱️ **Longer builds** (~20 minutes)
- 📦 **AAB format** (Google Play)
- 🏪 **Store distribution**
- 🚀 **Release ready**

### **Development Profile** (For developers)
- 🔧 **Development client**
- 🔄 **Hot reload support**
- 👨‍💻 **Debugging enabled**

## 🎮 **How to Trigger Builds**

### **Method 1: GitHub Actions (Automated) ⭐**
```yaml
# Triggers:
- Push to main → Production build
- Pull request → Preview build
- Manual dispatch → Custom build
```

### **Method 2: On-Demand GitHub Action ⭐**
1. Go to [GitHub Actions](https://github.com/idanaim/fixfox/actions)
2. Select "📱 Build APK On-Demand"
3. Click "Run workflow"
4. Choose options and run

### **Method 3: Local Command Line**
```bash
cd mobile-app

# Latest changes build
git pull origin main
eas build --platform android --profile preview --message "Latest UI changes"

# Specific feature build
eas build --platform android --profile preview --message "Feature: new chat UI"
```

### **Method 4: Expo Dashboard**
1. Visit [Expo Dashboard](https://expo.dev/accounts/idanaim82/projects/fixfox-mobile)
2. Click "Create a build"
3. Select platform and profile

## 📊 **Build Monitoring**

### **Track Your Builds:**
- 🌐 **Expo Dashboard**: https://expo.dev/accounts/idanaim82/projects/fixfox-mobile/builds
- 📱 **GitHub Actions**: https://github.com/idanaim/fixfox/actions
- 📧 **Notifications**: GitHub will notify on completion

### **Build Status:**
```bash
# Check latest build
cd mobile-app && eas build:list --limit=5

# Monitor specific build
eas build:view [BUILD_ID]
```

## 🎯 **Recommended Workflow**

### **For Regular Development:**
1. **Push changes** to main → **Automatic production build**
2. **Create PR** → **Automatic preview build** for testing
3. **Download APK** from Expo dashboard
4. **Test on device/emulator**

### **For Urgent Builds:**
1. **GitHub Actions** → "📱 Build APK On-Demand"
2. **Select preview profile** for fast builds
3. **Add descriptive message**
4. **Monitor in Expo dashboard**

### **For Local Development:**
```bash
# Quick local build
cd mobile-app
eas build --platform android --profile preview --local

# Cloud build with message
eas build --platform android --profile preview --message "Testing new feature X"
```

## 🔧 **Configuration Files**

### **EAS Build Config** (`mobile-app/eas.json`)
```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" }  // APK for easy testing
    },
    "production": {
      "android": { "buildType": "aab" }  // AAB for Play Store
    }
  }
}
```

### **CI/CD Config** (`.github/workflows/mobile-ci.yml`)
- ✅ Automatic builds on push/PR
- ✅ Manual dispatch with options
- ✅ Build notifications

## 📱 **APK Installation**

### **Download Locations:**
- 📱 **Expo Dashboard**: Direct APK download
- 💻 **GitHub Actions**: Build artifacts
- 📧 **Email**: Expo build notifications

### **Installation Methods:**
```bash
# ADB install
adb install path/to/fixfox.apk

# Drag & drop to emulator
# Or install directly on Android device
```

## 🚀 **Best Practices**

### **✅ DO:**
- Use **preview builds** for testing
- Add **descriptive messages** to builds
- **Monitor builds** in Expo dashboard
- **Test APKs** before releasing
- Use **CI/CD** for consistency

### **❌ DON'T:**
- Build production unnecessarily (costs build minutes)
- Forget to pull latest changes
- Skip testing preview builds
- Use development builds for distribution

## 🎯 **Summary**

**For most use cases, I recommend:**

1. **🔄 Enable CI/CD** (already configured)
2. **📱 Use on-demand builds** for urgent needs
3. **⚡ Preview profile** for testing
4. **🏪 Production profile** for releases
5. **📊 Monitor via Expo dashboard**

This hybrid approach gives you:
- ✅ **Automated builds** on code changes
- ✅ **On-demand builds** when needed
- ✅ **Fast feedback** with preview builds
- ✅ **Production-ready** builds for releases 
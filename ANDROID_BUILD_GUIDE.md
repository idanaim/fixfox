# FixFox Android APK Build Guide

## 🚀 **Building FixFox Android APK**

This guide will help you build an installable Android APK file for the FixFox mobile app.

## 📋 **Prerequisites**

✅ **Already Completed:**
- EAS CLI installed globally
- Logged into EAS account (`idanaim82`)
- EAS configuration file (`eas.json`) ready
- App configuration (`app.json`) set up
- API configured for production

## 🔧 **Build Options**

### **Option 1: Preview Build (APK) - Recommended for Testing**
```bash
cd mobile-app
eas build --platform android --profile preview
```

### **Option 2: Production Build (AAB) - For Google Play Store**
```bash
cd mobile-app
eas build --platform android --profile production
```

### **Option 3: Development Build - For Development/Testing**
```bash
cd mobile-app
eas build --platform android --profile development
```

## 🎯 **Recommended: Preview Build for APK**

The **preview** profile is perfect for creating an installable APK file:

### **Configuration (already set in `eas.json`):**
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"  // This creates APK instead of AAB
  }
}
```

### **Build Command:**
```bash
eas build --platform android --profile preview
```

## 📱 **App Information**

- **App Name**: FixFox Mobile
- **Package Name**: `com.idanaim.fixfox`
- **Version**: 1.0.0
- **API**: Production API (fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com)

## 🔄 **Build Process**

1. **Initiate Build**: Run the build command
2. **EAS Processing**: Build happens on Expo's servers
3. **Build Time**: Usually takes 10-20 minutes
4. **Download**: Get APK file from build dashboard

## 📥 **After Build Completion**

### **Download APK:**
1. **From Terminal**: Copy the download URL provided
2. **From Dashboard**: Visit https://expo.dev/accounts/idanaim82/projects/fixfox-mobile/builds
3. **Direct Download**: Click the download button for your build

### **Install APK:**
1. **Transfer to Android device** (USB, email, cloud storage)
2. **Enable "Install from Unknown Sources"** in Android settings
3. **Tap APK file** to install
4. **Open FixFox app** and test functionality

## 🛠 **Build Customization**

### **Update App Version (Optional):**
```bash
# Edit mobile-app/app.json
{
  "expo": {
    "version": "1.0.1"  // Update version number
  }
}
```

### **Update App Icon (Optional):**
- Replace `mobile-app/assets/icon.png` with your custom icon
- Replace `mobile-app/assets/adaptive-icon.png` for Android adaptive icon

### **Update Splash Screen (Optional):**
- Replace `mobile-app/assets/splash.png` with your custom splash screen

## 🔍 **Build Monitoring**

### **Check Build Status:**
```bash
eas build:list --platform android
```

### **View Build Logs:**
```bash
eas build:view [BUILD_ID]
```

### **Cancel Build (if needed):**
```bash
eas build:cancel [BUILD_ID]
```

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Build Fails - Dependencies**
   ```bash
   cd mobile-app
   npm install
   npx expo install --fix
   ```

2. **Build Fails - Expo SDK**
   ```bash
   npx expo doctor
   ```

3. **Build Fails - EAS Configuration**
   ```bash
   eas build:configure
   ```

## 📊 **Build Profiles Explained**

| Profile | Output | Use Case | Distribution |
|---------|---------|----------|--------------|
| `preview` | APK | Testing/Internal | Direct install |
| `production` | AAB | Play Store | Google Play |
| `development` | APK | Development | Dev testing |

## 🎉 **Quick Start Command**

For immediate APK build:

```bash
cd mobile-app
eas build --platform android --profile preview
```

## 📱 **Expected Output**

After successful build:
- **File**: `fixfox-mobile-v1.0.0.apk` (approximately 50-100MB)
- **Compatible**: Android 6.0+ (API level 23+)
- **Architecture**: Universal (works on all Android devices)
- **Features**: Full FixFox functionality with production API

## 📊 **Latest Build Status**

### ✅ **Current Build (CORS Fixed):**
- **Build ID**: `0ac8c37c-10f3-4979-9da0-728b97406285`
- **Status**: 🚀 **In Progress**
- **Features**: CORS issue resolved, production API working perfectly
- **Commit**: `568ba25` (includes CORS fix)
- **Message**: "CORS fix: Mobile app now works perfectly with production API"
- **Monitor**: https://expo.dev/accounts/idanaim82/projects/fixfox-mobile/builds/0ac8c37c-10f3-4979-9da0-728b97406285

### ✅ **Previous Build (Available for Download):**
- **Build ID**: `bbaf2339-4317-442e-84ef-75165e1f0f8c`
- **Status**: ✅ **Completed**
- **Download**: https://expo.dev/artifacts/eas/pbdbScwxQ5Cp5Pe2E27Z5y.apk
- **Started**: 6/25/2025, 8:41:52 AM
- **Finished**: 6/25/2025, 9:00:01 AM

## 🔗 **Useful Links**

- **Build Dashboard**: https://expo.dev/accounts/idanaim82/projects/fixfox-mobile/builds
- **EAS Documentation**: https://docs.expo.dev/build/introduction/
- **Expo CLI Reference**: https://docs.expo.dev/more/expo-cli/ 
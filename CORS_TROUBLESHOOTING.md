# CORS Troubleshooting Guide

## ✅ **Recent Fixes Applied**

### **Server-Side Fixes (Just Deployed):**
1. **Removed `debugger` statement** from auth controller
2. **Enhanced CORS configuration** with comprehensive origin handling
3. **Added support for custom headers** including `token` header
4. **Improved browser compatibility** with `optionsSuccessStatus: 200`

## 🔍 **CORS Issue Diagnosis**

### **Current CORS Headers (Working):**
```
Access-Control-Allow-Origin: http://localhost:8083
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers,token
```

## 🚨 **Common CORS Issues & Solutions**

### **1. Browser Cache Issues**
**Problem**: Browser caching old CORS responses
**Solution**:
```bash
# Clear browser cache completely
# Or use incognito/private browsing mode
# Or hard refresh with Ctrl+Shift+R (Cmd+Shift+R on Mac)
```

### **2. Custom Headers**
**Problem**: Using custom headers not allowed by CORS
**Solution**: We've added `token` header support. If you use other custom headers, add them to the `allowedHeaders` array.

### **3. Credentials Issues**
**Problem**: Sending cookies/credentials without proper CORS setup
**Solution**: Ensure your client is configured correctly:

```javascript
// For fetch requests
fetch('http://your-api.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:8083'
  },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({email: 'test', password: 'test'})
});

// For axios requests
axios.defaults.withCredentials = true;
```

### **4. Development vs Production Origins**
**Problem**: Different origins in dev vs prod
**Solution**: Our CORS config now handles:
- `http://localhost:8083` (your current setup)
- `http://localhost:3000` 
- `http://localhost:8080`
- Any localhost port pattern

## 🧪 **Testing CORS After Deployment**

### **Wait 3-5 minutes for deployment, then test:**

```bash
# Test 1: Basic auth endpoint
curl -v 'http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api/auth/login' \
  -H 'Origin: http://localhost:8083' \
  -H 'Content-Type: application/json' \
  --data-raw '{"email":"doron@gmail.com","password":"12345"}'

# Test 2: Users endpoint
curl -v 'http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api/user/all/74249b89-98d9-4827-978f-e01db115e487' \
  -H 'Origin: http://localhost:8083'

# Test 3: OPTIONS preflight
curl -v -X OPTIONS 'http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api/auth/login' \
  -H 'Origin: http://localhost:8083' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type'
```

## 🔧 **Client-Side Configuration**

### **Mobile App Configuration:**
If you're using React Native or Expo, ensure your API calls include proper headers:

```javascript
// In your API configuration
const API_BASE_URL = 'http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api';

// For fetch
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify(credentials)
});

// For axios
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
```

### **Web App Configuration:**
```javascript
// If using axios in web app
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api',
  withCredentials: true, // Important for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
  }
});
```

## 🐛 **Debugging Steps**

### **1. Check Browser Developer Tools:**
- Open Network tab
- Look for failed OPTIONS requests (preflight)
- Check if CORS error appears in Console
- Verify request/response headers

### **2. Check Server Logs:**
```bash
# Monitor deployment
# Go to GitHub Actions: https://github.com/idanaim/fixfox/actions
# Check latest deployment status
```

### **3. Test Different Scenarios:**
```bash
# Test without Origin header (should work)
curl 'http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  --data-raw '{"email":"doron@gmail.com","password":"12345"}'

# Test with different Origin
curl 'http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api/auth/login' \
  -H 'Origin: http://localhost:3000' \
  -H 'Content-Type: application/json' \
  --data-raw '{"email":"doron@gmail.com","password":"12345"}'
```

## 📞 **Next Steps**

1. **Wait for deployment** (3-5 minutes)
2. **Clear browser cache** or use incognito mode
3. **Test endpoints** using the commands above
4. **Check mobile app configuration** if still having issues
5. **Report specific error messages** if problems persist

## 🎯 **Expected Results After Fix**

- ✅ No more CORS errors in browser console
- ✅ Auth endpoint returns JWT token
- ✅ Users endpoint returns user data
- ✅ Mobile app can connect successfully
- ✅ All preflight OPTIONS requests succeed 
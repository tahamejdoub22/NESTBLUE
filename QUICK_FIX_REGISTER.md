# 🚨 Quick Fix: Register Error

## The Problem

You're seeing this error in the console:
```
POST http://localhost:3001/api/auth/register net::ERR_CONNECTION_REFUSED
```

**This means the backend server is not running!**

## ✅ Solution: Start the Backend (Takes 30 seconds)

### Step 1: Open a NEW Terminal
Keep your frontend terminal running, open a **NEW** PowerShell or Command Prompt window.

### Step 2: Navigate to Backend
```powershell
cd "c:\Users\taha mejdoub\project cost management app\backend"
```

### Step 3: Start the Server
```powershell
npm run start:dev
```

### Step 4: Wait for This Message
You should see:
```
🚀 Application is running on: http://localhost:3001
📚 Swagger documentation: http://localhost:3001/api
```

### Step 5: Try Registering Again
Go back to your frontend and try registering. The error should be gone!

## 🎯 Quick Commands

**PowerShell:**
```powershell
cd "c:\Users\taha mejdoub\project cost management app\backend"
npm run start:dev
```

**Or use the script:**
```powershell
cd "c:\Users\taha mejdoub\project cost management app\backend"
.\start-backend.ps1
```

## ⚠️ Important

- **Keep the backend terminal open** - don't close it!
- **Both servers must run:**
  - Frontend: `http://localhost:3000` (your current terminal)
  - Backend: `http://localhost:3001` (new terminal)

## 🔍 Verify It's Working

1. Open `http://localhost:3001/api` in your browser
2. You should see Swagger API documentation
3. Try registering in your frontend - it should work!

## ❓ Still Not Working?

1. **Check if port 3001 is in use:**
   ```powershell
   netstat -ano | findstr :3001
   ```

2. **Check backend .env file:**
   ```powershell
   cd "c:\Users\taha mejdoub\project cost management app\backend"
   type .env | findstr PORT
   ```
   Should show: `PORT=3001`

3. **Install dependencies:**
   ```powershell
   cd "c:\Users\taha mejdoub\project cost management app\backend"
   npm install
   ```

---

**That's it! Once the backend is running, registration will work perfectly. 🚀**



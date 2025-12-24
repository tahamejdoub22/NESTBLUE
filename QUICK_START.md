# 🚀 Quick Start Guide - Fix Register Endpoint

## The Problem
You're seeing `ERR_CONNECTION_REFUSED` because **the backend server is not running**.

## ✅ Solution: Start the Backend Server

### Option 1: Using PowerShell Script (Recommended)
1. Open a **NEW** PowerShell terminal
2. Navigate to backend:
   ```powershell
   cd "c:\Users\taha mejdoub\project cost management app\backend"
   ```
3. Run the startup script:
   ```powershell
   .\start-backend.ps1
   ```

### Option 2: Using Batch File
1. Open a **NEW** Command Prompt terminal
2. Navigate to backend:
   ```cmd
   cd "c:\Users\taha mejdoub\project cost management app\backend"
   ```
3. Run the startup script:
   ```cmd
   start-backend.bat
   ```

### Option 3: Manual Start
1. Open a **NEW** terminal
2. Navigate to backend:
   ```bash
   cd "c:\Users\taha mejdoub\project cost management app\backend"
   ```
3. Start the server:
   ```bash
   npm run start:dev
   ```

## ✅ What You Should See

When the backend starts successfully, you'll see:
```
🚀 Application is running on: http://localhost:3001
📚 Swagger documentation: http://localhost:3001/api
```

## ✅ Verify It's Working

1. **Check Swagger Docs:** Open `http://localhost:3001/api` in your browser
2. **Try Registration:** Go back to your frontend and try registering a user
3. **Check Console:** The error should be gone!

## 📋 Current Configuration

- **Frontend:** `http://localhost:3000` (Next.js)
- **Backend:** `http://localhost:3001` (NestJS)
- **API Endpoint:** `http://localhost:3001/api/auth/register`

## ⚠️ Important Notes

1. **Keep the backend terminal open** - Don't close it while developing
2. **Both servers must run simultaneously:**
   - Frontend terminal: Running Next.js
   - Backend terminal: Running NestJS
3. **If you see errors:**
   - Check the backend terminal for error messages
   - Verify `.env` file has `PORT=3001`
   - Make sure database is accessible

## 🔧 Troubleshooting

### Backend won't start?
- Check if port 3001 is already in use
- Verify `.env` file exists and has correct configuration
- Run `npm install` in the backend directory

### Still seeing connection errors?
- Make sure backend terminal shows "Application is running on: http://localhost:3001"
- Check browser console for the exact error message
- Verify CORS is configured correctly (should allow `http://localhost:3000`)

### Database connection errors?
- Check `DATABASE_URL` in `.env` file
- Run migrations: `npm run migration:run` in backend directory

## 📞 Need Help?

Check these files for more details:
- `START_BACKEND.md` - Detailed backend setup instructions
- `backend/src/main.ts` - Backend configuration
- `frontend/src/core/services/api.ts` - Frontend API configuration


# 🔧 Fix Backend Startup Issues

## Current Problem
The backend server is not starting or not accessible on port 3001.

## ✅ Step-by-Step Fix

### Step 1: Stop Any Running Processes
If you have the backend running, press `Ctrl+C` to stop it.

### Step 2: Check for Port Conflicts
```powershell
netstat -ano | findstr :3001
```
If something is using port 3001, you'll see output. Note the PID and kill it:
```powershell
taskkill /PID <PID_NUMBER> /F
```

### Step 3: Verify .env File
Make sure you have a `.env` file in the backend directory with:
```env
PORT=3001
DATABASE_URL=your_database_url_here
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### Step 4: Install Dependencies (if needed)
```powershell
cd "c:\Users\taha mejdoub\project cost management app\backend"
npm install
```

### Step 5: Start the Backend
```powershell
npm run start:dev
```

### Step 6: Watch for These Messages
You should see:
1. `[NestFactory] Starting Nest application...`
2. `[InstanceLoader] ... dependencies initialized`
3. Database connection queries
4. `✅ Migrations completed successfully` (if migrations run)
5. **MOST IMPORTANT:** `🚀 Application is running on: http://localhost:3001`

### Step 7: Verify It's Working
Once you see "Application is running", test in browser:
- `http://localhost:3001/api` - Should show Swagger docs
- `http://localhost:3001/api/health` - Should show `{"status":"ok",...}`

## 🐛 Common Issues

### Issue 1: Server Starts But Crashes Immediately
**Symptoms:** Server starts then exits
**Solution:** Check the terminal for error messages. Common causes:
- Missing DATABASE_URL in .env
- Database connection failed
- Port already in use

### Issue 2: Migrations Run But Server Doesn't Start
**Symptoms:** See "Migrations completed" but no "Application is running"
**Solution:** 
- Wait a few more seconds (startup can take time)
- Check for errors after migrations
- Look for database connection issues

### Issue 3: Port Already in Use
**Symptoms:** Error about port 3001 being in use
**Solution:**
```powershell
# Find what's using the port
netstat -ano | findstr :3001

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue 4: Database Connection Failed
**Symptoms:** Errors about database connection
**Solution:**
- Verify DATABASE_URL in .env is correct
- Check if database is accessible
- Verify network connection

## 🔍 Debug Commands

### Check Backend Status
```powershell
cd "c:\Users\taha mejdoub\project cost management app\backend"
.\check-backend.ps1
```

### Check Port
```powershell
Test-NetConnection -ComputerName localhost -Port 3001
```

### View Backend Logs
Look at the terminal where you ran `npm run start:dev` for:
- Error messages
- Database connection status
- Module initialization errors

## ✅ Success Indicators

When the backend is running correctly, you'll see:
1. ✅ `🚀 Application is running on: http://localhost:3001`
2. ✅ `📚 Swagger documentation: http://localhost:3001/api`
3. ✅ `💚 Health check: http://localhost:3001/api/health`
4. ✅ Browser can access `http://localhost:3001/api`
5. ✅ Browser can access `http://localhost:3001/api/health`

## 🚀 Quick Restart

If you need to restart:
1. Press `Ctrl+C` in the backend terminal
2. Wait for it to stop
3. Run `npm run start:dev` again
4. Wait for "Application is running" message

---

**Once you see "Application is running", the backend is ready and registration will work!**



# How to Start the Backend Server

## ⚠️ IMPORTANT: Backend Must Be Running!

The frontend is configured to connect to `http://localhost:3001/api`. If you see `ERR_CONNECTION_REFUSED`, the backend is not running.

## Quick Start

1. **Open a NEW terminal window** (keep your frontend running in the current one)

2. **Navigate to backend directory:**
   ```bash
   cd "C:\Users\taha mejdoub\project cost management app\backend"
   ```

3. **Verify .env file exists and has correct port:**
   ```bash
   # Check if PORT is set to 3001
   type .env | findstr PORT
   ```
   Should show: `PORT=4000`

4. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

5. **Start the backend server:**
   ```bash
   npm run start:dev
   ```

6. **Wait for the server to start** - You should see:
   ```
   🚀 Application is running on: http://localhost:3001
   📚 Swagger documentation: http://localhost:3001/api
   ```

7. **Verify it's working:**
   - Open browser: `http://localhost:4000/api` (should show Swagger docs)
   - Try registering a user in your frontend

## Current Configuration

- **Frontend (Next.js):** `http://localhost:3000`
- **Backend (NestJS):** `http://localhost:4000`
- **API Base URL:** `http://localhost:4000/api`
- **CORS:** Allows requests from `http://localhost:3000`

## Troubleshooting

### If you see `ERR_CONNECTION_REFUSED`:
- **The backend is not running!** Follow steps 1-5 above to start it.
- Make sure the backend terminal stays open (don't close it).

### If you see database connection errors:
- Make sure your Neon database is accessible
- Check that `DATABASE_URL` in `.env` is correct
- Run migrations: `npm run migration:run`

### If port 3001 is already in use:
- Check what's using port 4000: `netstat -ano | findstr :4000`
- Change `PORT=4001` in `backend/.env` and update frontend API URL

### If you see module not found errors:
- Run: `npm install` in the backend directory

### If the server starts but register still fails:
- Check browser console for specific error messages
- Verify CORS is allowing `http://localhost:3000`
- Check backend terminal for error logs

## Important Notes

- **Keep the backend terminal open** - the server needs to keep running
- **Both servers must run simultaneously:**
  - Frontend: `http://localhost:3000` (Next.js)
  - Backend: `http://localhost:3001` (NestJS)
- **The frontend is already configured** to call `http://localhost:3001/api`



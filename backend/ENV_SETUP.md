# Environment Variables Setup Guide

## 🚀 Quick Setup

### Option 1: Use Setup Script (Recommended)
```bash
npm run setup:env
```

This will create a `.env` file with all your actual credentials pre-filled.

### Option 2: Manual Setup
1. Copy the template:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values (your Neon credentials are already in the template)

## 📋 Your Current Configuration

Your `.env` file should contain:

```env
# Database (Your Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_1ujzKyerhBH7@ep-quiet-king-a43l6z6w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEON_API_KEY=napi_gdd7sck56a059w1dfpkabibmxhbf6k2mxnxjxe22f8io7fvxehh612j3miu3j3k9

# JWT Secrets (Change these in production!)
JWT_SECRET=cost-management-super-secret-jwt-key-2024-production-change-this-immediately
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=cost-management-super-secret-refresh-key-2024-production-change-this-immediately
JWT_REFRESH_EXPIRES_IN=30d

# Application
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

## 🔒 Security Notes

1. **JWT Secrets**: The current secrets are for development. **Generate new ones for production:**
   ```bash
   openssl rand -base64 64
   ```

2. **Never Commit**: `.env` is in `.gitignore` - never commit it!

3. **Production**: Use different secrets and stronger values in production.

## ✅ Verification

After creating `.env`, verify it works:
```bash
npm run start:dev
```

The server should start and connect to your Neon database successfully.



#!/usr/bin/env node

/**
 * Environment Setup Script
 * Creates .env file from template with your actual credentials
 */

const fs = require('fs');
const path = require('path');

const envTemplate = `# ============================================
# COST MANAGEMENT BACKEND - ENVIRONMENT VARIABLES
# ============================================
# IMPORTANT: Never commit this file to version control!

# ============================================
# DATABASE CONFIGURATION (Neon PostgreSQL)
# ============================================
DATABASE_URL=postgresql://neondb_owner:your_password@ep-quiet-king-a43l6z6w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Neon API Key
NEON_API_KEY=your_neon_api_key

# ============================================
# JWT AUTHENTICATION CONFIGURATION
# ============================================
# IMPORTANT: Change these to strong random strings in production!
# Generate with: openssl rand -base64 64
JWT_SECRET=your_jwt_secret_key_change_immediately
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_jwt_refresh_secret_change_immediately
JWT_REFRESH_EXPIRES_IN=30d

# ============================================
# APPLICATION CONFIGURATION
# ============================================
PORT=4000
NODE_ENV=development
APP_NAME=Cost Management API
APP_VERSION=1.0.0
FRONTEND_URL=http://localhost:3000

# ============================================
# CORS CONFIGURATION
# ============================================
CORS_ORIGIN=http://localhost:3000

# ============================================
# EMAIL SERVICE CONFIGURATION (Optional)
# ============================================
# Uncomment and configure if you need email functionality
# EMAIL_PROVIDER=smtp
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# SMTP_FROM=noreply@costmanagement.com

# ============================================
# FILE STORAGE CONFIGURATION (Optional)
# ============================================
# Uncomment and configure if you need file uploads
# FILE_STORAGE_PROVIDER=local
# FILE_STORAGE_PATH=./uploads
# MAX_FILE_SIZE=10485760
# ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# ============================================
# RATE LIMITING CONFIGURATION (Optional)
# ============================================
# RATE_LIMIT_ENABLED=true
# RATE_LIMIT_WINDOW_MS=900000
# RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# LOGGING CONFIGURATION (Optional)
# ============================================
# LOG_LEVEL=info
# LOG_FORMAT=json
# LOG_FILE_ENABLED=false
# LOG_FILE_PATH=./logs/app.log

# ============================================
# REDIS CONFIGURATION (Optional)
# ============================================
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
# REDIS_DB=0

# ============================================
# SECURITY CONFIGURATION
# ============================================
# SESSION_SECRET=your-session-secret-change-this
# PASSWORD_RESET_EXPIRES_HOURS=1
# EMAIL_VERIFICATION_EXPIRES_HOURS=24

# ============================================
# MONITORING & ANALYTICS (Optional)
# ============================================
# SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# ============================================
# FEATURE FLAGS (Optional)
# ============================================
# EMAIL_VERIFICATION_ENABLED=true
# PASSWORD_RESET_ENABLED=true
# FILE_UPLOAD_ENABLED=true
# REALTIME_ENABLED=false

# ============================================
# DEVELOPMENT ONLY
# ============================================
# SWAGGER_ENABLED=true
# API_LOGGING_ENABLED=true

# ============================================
# NODE OPTIONS (Suppress deprecation warnings)
# ============================================
# NODE_OPTIONS=--no-deprecation
`;

const envPath = path.join(__dirname, '.env');

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('   If you want to recreate it, delete the existing file first.');
    process.exit(0);
  }

  // Create .env file
  fs.writeFileSync(envPath, envTemplate, 'utf8');
  console.log('✅ .env file created successfully!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('   1. Review the .env file and update any values if needed');
  console.log('   2. For production, generate new JWT secrets:');
  console.log('      openssl rand -base64 64');
  console.log('   3. Never commit .env to version control!');
  console.log('');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

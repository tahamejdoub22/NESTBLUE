# Environment Variables Documentation

## 🔐 Security Notice

**NEVER commit `.env` files to version control!** They contain sensitive information.

## 📋 Required Variables

### Database Configuration
- `DATABASE_URL` - Full Neon PostgreSQL connection string
- `NEON_API_KEY` - Neon API key for programmatic access

### JWT Authentication
- `JWT_SECRET` - Secret key for signing JWT access tokens (REQUIRED)
- `JWT_EXPIRES_IN` - Access token expiration (default: "7d")
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens (REQUIRED)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: "30d")

### Application
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment: development | production | test
- `CORS_ORIGIN` - Allowed frontend origin

## 🔧 Optional Variables

### Email Service
Configure one of:
- **SMTP**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- **SendGrid**: `SENDGRID_API_KEY`
- **Mailgun**: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`
- **AWS SES**: `AWS_SES_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

### File Storage
- `FILE_STORAGE_PROVIDER` - local | s3 | cloudinary
- For S3: `AWS_S3_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `MAX_FILE_SIZE` - Maximum file size in bytes

### Rate Limiting
- `RATE_LIMIT_ENABLED` - Enable rate limiting
- `RATE_LIMIT_WINDOW_MS` - Time window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

### Logging
- `LOG_LEVEL` - error | warn | info | debug | verbose
- `LOG_FORMAT` - json | simple

### Redis (Optional)
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`

### Monitoring
- `SENTRY_DSN` - Sentry error tracking

## 🚀 Quick Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your actual values:
   - Database connection string
   - JWT secrets (generate with `openssl rand -base64 64`)
   - CORS origin
   - Other optional services

3. For production, use `.env.production.example` as a template

## 🔒 Security Best Practices

1. **Generate Strong Secrets:**
   ```bash
   openssl rand -base64 64
   ```

2. **Use Different Secrets:**
   - `JWT_SECRET` and `JWT_REFRESH_SECRET` must be different
   - Use unique secrets for each environment

3. **Never Commit .env:**
   - Already in `.gitignore`
   - Use `.env.example` for documentation

4. **Rotate Secrets Regularly:**
   - Change JWT secrets periodically
   - Rotate database passwords

5. **Use Environment-Specific Files:**
   - `.env.development` for development
   - `.env.production` for production
   - `.env.test` for testing

## 📝 Current Configuration

Your `.env` file is configured with:
- ✅ Neon PostgreSQL connection
- ✅ Neon API key
- ✅ JWT secrets (change in production!)
- ✅ Development settings

## ⚠️ Production Checklist

Before deploying to production:
- [ ] Generate new JWT secrets
- [ ] Set `NODE_ENV=production`
- [ ] Configure email service
- [ ] Set up file storage (S3 recommended)
- [ ] Enable rate limiting
- [ ] Configure monitoring (Sentry)
- [ ] Set proper CORS origin
- [ ] Disable Swagger if not needed
- [ ] Set up proper logging



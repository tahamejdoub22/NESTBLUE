# Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Neon PostgreSQL database (already configured)

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

The `.env` file is already configured with your Neon database credentials. The file includes:

- Database connection string
- JWT secrets
- Application port
- CORS origin

### 3. Database Setup

The application uses TypeORM with `synchronize: true` in development mode, which will automatically create tables when you start the server.

**For Production**: Set `NODE_ENV=production` and use migrations instead.

### 4. Start the Development Server

```bash
npm run start:dev
```

The API will be available at:
- **API**: `http://localhost:3000/api`
- **Swagger Documentation**: `http://localhost:3000/api`

### 5. Test the API

1. **Register a new user**:
```bash
POST http://localhost:3000/api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

2. **Login**:
```bash
POST http://localhost:3000/api/auth/login
{
  "email": "john@example.com",
  "password": "Password123"
}
```

3. **Use the token** in subsequent requests:
```bash
Authorization: Bearer <your-token>
```

## API Endpoints

All endpoints are documented in Swagger UI at `http://localhost:3000/api`

### Main Endpoints:

- **Auth**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Projects**: `/api/projects/*` (uses `uid` not `id`)
- **Tasks**: `/api/tasks/*` (uses `uid` not `id`)
- **Costs**: `/api/costs/*`
- **Expenses**: `/api/expenses/*`
- **Budgets**: `/api/budgets/*`
- **Contracts**: `/api/contracts/*`
- **Sprints**: `/api/sprints/*`

## Important Notes

### Projects and Tasks Use `uid`

- Projects use `uid` as primary key (not `id`)
- Tasks use `uid` as primary key (not `id`)
- All other entities use `id` (UUID)

### Database Schema

The application automatically creates the following tables:
- users
- projects
- tasks
- subtasks
- comments
- attachments
- costs
- expenses
- budgets
- contracts
- sprints
- conversations
- messages
- notifications

### Authentication

- JWT tokens are used for authentication
- Tokens are stored in localStorage on the frontend
- Refresh tokens are stored in the database
- All protected routes require `Authorization: Bearer <token>` header

## Troubleshooting

### Database Connection Issues

1. Verify your `.env` file has the correct `DATABASE_URL`
2. Check that your Neon database is accessible
3. Ensure SSL is enabled (already configured)

### Port Already in Use

Change the `PORT` in `.env` file if port 3000 is already in use.

### TypeORM Errors

If you see TypeORM errors:
1. Check database connection string
2. Verify all entities are properly imported in `app.module.ts`
3. Ensure database has proper permissions

## Production Deployment

1. Set `NODE_ENV=production`
2. Disable `synchronize` in database config
3. Use migrations for schema changes
4. Set strong JWT secrets
5. Configure proper CORS origins
6. Use environment variables for all secrets

## Next Steps

1. Test all endpoints using Swagger UI
2. Integrate with frontend
3. Add file upload handling for attachments
4. Implement email service for password reset
5. Add rate limiting
6. Set up logging



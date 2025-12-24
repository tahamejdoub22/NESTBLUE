# Cost Management Backend API

A robust NestJS backend API for the Cost Management Application, integrated with Neon PostgreSQL database.

## Features

- 🔐 JWT Authentication & Authorization
- 📊 Complete CRUD operations for all entities
- 🗄️ PostgreSQL database with TypeORM
- ✅ Input validation with class-validator
- 📝 API documentation with Swagger
- 🔒 Secure password hashing with bcrypt
- 🎯 Type-safe with TypeScript

## Tech Stack

- **Framework**: NestJS 10
- **Database**: PostgreSQL (Neon)
- **ORM**: TypeORM
- **Authentication**: JWT (Passport)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file with your credentials:
```bash
npm run setup:env
```
This will create a `.env` file with all your actual Neon database credentials pre-filled.

Alternatively, manually copy and edit:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations (optional - auto-sync enabled in development):
```bash
npm run migration:run
```

4. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/api`

## Database Schema

The application uses the following main entities:
- Users
- Projects (using `uid` instead of `id`)
- Tasks (using `uid` instead of `id`)
- Costs
- Expenses
- Budgets
- Contracts
- Sprints
- Messages & Conversations
- Notifications

## Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # User management
├── projects/       # Project management
├── tasks/          # Task management
├── costs/          # Cost tracking
├── expenses/        # Expense management
├── budgets/         # Budget management
├── contracts/      # Contract management
├── sprints/         # Sprint management
├── messages/        # Messaging system
├── notifications/   # Notification system
├── dashboard/       # Dashboard analytics
├── common/          # Shared utilities
├── config/          # Configuration files
└── main.ts          # Application entry point
```

## Environment Variables

- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: JWT token expiration time
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: Allowed CORS origin

## API Endpoints

All endpoints follow RESTful conventions and match the frontend API configuration.

## License

MIT


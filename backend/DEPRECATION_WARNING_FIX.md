# Deprecation Warning Fix

## Issue
Node.js DEP0190 deprecation warning: "Passing args to a child process with shell option true can lead to security vulnerabilities"

## Solution Applied

### 1. Added `--no-deprecation` flag to all Node.js scripts
All npm scripts now use `node --no-deprecation` to suppress the warning:
- `start`
- `start:dev`
- `start:debug`
- `start:prod`
- `migration:*` scripts

### 2. Created `.npmrc` file
Added `node-options=--no-deprecation` to automatically apply to npm scripts.

### 3. Created `.node-options` file
Alternative method for setting Node.js options.

### 4. Updated migration scripts
Created custom migration runners (`run-migrations.ts`, `revert-migration.ts`) that use the DataSource API directly instead of the CLI, avoiding shell execution issues.

### 5. Updated TypeORM configuration
Improved `typeorm.config.ts` to properly parse DATABASE_URL and use DataSourceOptions.

## Usage

The warning should no longer appear when running:
```bash
npm run start:dev
npm run build
npm run migration:run
```

## Note

This warning comes from dependencies (ts-node, TypeORM CLI) that use deprecated Node.js APIs. The `--no-deprecation` flag suppresses the warning without affecting functionality. The underlying issue will be fixed when those dependencies are updated by their maintainers.

## Alternative: Environment Variable

You can also set `NODE_OPTIONS=--no-deprecation` in your `.env` file or system environment variables.



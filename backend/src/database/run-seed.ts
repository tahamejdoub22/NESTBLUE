#!/usr/bin/env node

/**
 * Database Seed Runner
 * 
 * This script runs the database seed to populate the database with sample data.
 * 
 * Usage:
 *   npm run seed
 *   or
 *   ts-node src/database/run-seed.ts
 */

import { seed } from './seed';

seed()
  .then(() => {
    console.log('✅ Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });


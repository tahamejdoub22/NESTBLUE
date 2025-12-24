import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function addSprintIdColumn() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  // Parse the database URL
  const url = new URL(databaseUrl);
  const username = url.username;
  const password = url.password;
  const host = url.hostname;
  const port = parseInt(url.port) || 5432;
  const database = url.pathname.slice(1);
  const ssl = url.searchParams.get('sslmode') === 'require';

  const dataSource = new DataSource({
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: true,
  });
  
  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Check if sprintId column exists
    const columnCheck = await dataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tasks' 
      AND LOWER(column_name) = 'sprintid';
    `);

    if (columnCheck.length > 0) {
      console.log(`✅ sprintId column already exists as: ${columnCheck[0].column_name} (${columnCheck[0].data_type})`);
    } else {
      console.log('📝 Adding sprintId column to tasks table...');
      
      // Add the column
      await dataSource.query(`
        ALTER TABLE "tasks" 
        ADD COLUMN "sprintId" uuid;
      `);
      
      console.log('✅ sprintId column added successfully');
      
      // Verify it was added
      const verify = await dataSource.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND LOWER(column_name) = 'sprintid';
      `);
      
      if (verify.length > 0) {
        console.log(`✅ Verified: sprintId column exists as: ${verify[0].column_name} (${verify[0].data_type})`);
      } else {
        throw new Error('Column was not added successfully');
      }
    }

    // Also check projectId column type
    const projectIdCheck = await dataSource.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tasks' 
      AND LOWER(column_name) = 'projectid';
    `);

    if (projectIdCheck.length > 0) {
      const col = projectIdCheck[0];
      if (col.data_type !== 'character varying' || col.character_maximum_length !== 50) {
        console.log('📝 Fixing projectId column type...');
        await dataSource.query(`
          ALTER TABLE "tasks" 
          ALTER COLUMN "projectId" TYPE varchar(50);
        `);
        console.log('✅ projectId column type fixed');
      } else {
        console.log('✅ projectId column type is correct');
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('✅ Database connection closed');
    }
  }
}

addSprintIdColumn();

import { Client } from "pg";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../../.env") });

async function fixSprintIdColumn() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not defined in environment variables");
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    console.log("🔧 Checking and fixing sprintId column...");
    await client.connect();

    // Check if column exists (check both quoted and unquoted versions)
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tasks' 
      AND (column_name = 'sprintId' OR column_name = 'sprintid' OR LOWER(column_name) = 'sprintid')
    `;
    const columnResult = await client.query(checkColumnQuery);

    // Also list all columns for debugging
    const allColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tasks'
      ORDER BY ordinal_position
    `;
    const allColumns = await client.query(allColumnsQuery);
    console.log(
      "📋 All columns in tasks table:",
      allColumns.rows.map((r) => r.column_name).join(", "),
    );

    if (columnResult.rows.length === 0) {
      console.log("➕ Adding sprintId column to tasks table...");

      // Add the column
      await client.query(`
        ALTER TABLE "tasks" 
        ADD COLUMN "sprintId" uuid
      `);

      // Check if sprints table exists
      const checkSprintsTable = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sprints'
      `;
      const sprintsTableResult = await client.query(checkSprintsTable);

      if (sprintsTableResult.rows.length > 0) {
        // Check if foreign key constraint already exists
        const checkFkQuery = `
          SELECT constraint_name 
          FROM information_schema.table_constraints 
          WHERE table_schema = 'public' 
          AND table_name = 'tasks' 
          AND constraint_name = 'FK_tasks_sprintId'
        `;
        const fkResult = await client.query(checkFkQuery);

        if (fkResult.rows.length === 0) {
          console.log("➕ Adding foreign key constraint...");
          await client.query(`
            ALTER TABLE "tasks" 
            ADD CONSTRAINT "FK_tasks_sprintId" 
            FOREIGN KEY ("sprintId") 
            REFERENCES "sprints"("id") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
          `);
        } else {
          console.log("ℹ️  Foreign key constraint already exists");
        }
      }

      console.log("✅ sprintId column added successfully");
    } else {
      console.log("ℹ️  sprintId column already exists");

      // Verify foreign key constraint
      const checkFkQuery = `
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND constraint_name = 'FK_tasks_sprintId'
      `;
      const fkResult = await client.query(checkFkQuery);

      if (fkResult.rows.length === 0) {
        console.log("⚠️  Foreign key constraint is missing, adding it...");
        const checkSprintsTable = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'sprints'
        `;
        const sprintsTableResult = await client.query(checkSprintsTable);

        if (sprintsTableResult.rows.length > 0) {
          await client.query(`
            ALTER TABLE "tasks" 
            ADD CONSTRAINT "FK_tasks_sprintId" 
            FOREIGN KEY ("sprintId") 
            REFERENCES "sprints"("id") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
          `);
          console.log("✅ Foreign key constraint added");
        }
      } else {
        console.log("✅ Foreign key constraint exists");
      }
    }
  } catch (error) {
    console.error("❌ Failed to fix sprintId column:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixSprintIdColumn();

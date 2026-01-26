import { DataSource } from "typeorm";
import { dataSourceOptions } from "../config/typeorm.config";

async function runMigrations() {
  const dataSource = new DataSource(dataSourceOptions);
  let isInitialized = false;
  let exitCode = 0;

  try {
    console.log("🔄 Running migrations...");
    await dataSource.initialize();
    isInitialized = true;

    await dataSource.runMigrations();
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    exitCode = 1;
  } finally {
    if (isInitialized && dataSource.isInitialized) {
      try {
        await dataSource.destroy();
      } catch (destroyError) {
        console.error("⚠️  Error closing database connection:", destroyError);
      }
    }
    // Only exit with error code, let successful migrations exit naturally
    // This prevents the process.exit override in main.ts from blocking successful exits
    if (exitCode !== 0) {
      process.exit(exitCode);
    }
    // For success, just return - the script will exit naturally
  }
}

runMigrations();

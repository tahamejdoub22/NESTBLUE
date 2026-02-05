import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { join } from "path";

config();

// Parse DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const url = new URL(databaseUrl);
const username = url.username;
const password = url.password;
const host = url.hostname;
const port = parseInt(url.port) || 5432;
const database = url.pathname.slice(1); // Remove leading '/'
const ssl = url.searchParams.get("sslmode") === "require";

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host,
  port,
  username,
  password,
  database,
  ssl: ssl ? { rejectUnauthorized: false } : false,
  entities: [join(__dirname, "../**/*.entity{.ts,.js}")],
  migrations: [join(__dirname, "../migrations/*{.ts,.js}")],
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
};

export default new DataSource(dataSourceOptions);

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Connection pool for PostgreSQL
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'postgres',
  user: process.env.DATABASE_USER || 'order',
  password: process.env.DATABASE_PASSWORD,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  // 2s was too tight: a cold Turbopack start plus a cold pool intermittently
  // exceeded it and rendered a 500 on first paint.
  connectionTimeoutMillis: 10000,
});

// Drizzle instance with schema
export const db = drizzle({client: pool, schema, logger: process.env.NODE_ENV === 'development'});

// Type exports
export type Database = typeof db;

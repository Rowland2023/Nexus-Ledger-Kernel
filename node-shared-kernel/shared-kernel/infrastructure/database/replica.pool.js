// infrastructure/database/replica.pool.js
import pg from 'pg';

const { Pool } = pg;

export const replicaPool = new Pool({
  host: 'localhost',
  user: 'youruser',
  password: 'yourpassword',
  database: 'yourdb_replica',
  port: 5432,
});

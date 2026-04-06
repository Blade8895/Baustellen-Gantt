import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
dotenv.config();

export const config = {
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  sqlitePath: process.env.SQLITE_DB_PATH || './data/baustellen.db',
};

import { Pool } from 'pg';

const conn = process.env.DATABASE_URL;
const masked = typeof conn === 'string' ? conn.replace(/:\/\/.+?:.+?@/, '://***:***@') : String(conn);
console.log('server db connecting to:', masked);

const pool = new Pool({ connectionString: conn });
export default pool;
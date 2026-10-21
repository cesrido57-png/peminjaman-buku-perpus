import { Pool, PoolClient } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Pastikan file .env.local berisi DATABASE_URL.');
  }
  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export const pool: Pool = globalThis.__pgPool ?? createPool();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__pgPool = pool;
}

export async function query<T extends Record<string, any> = Record<string, any>>(
  text: string,
  params: any[] = []
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

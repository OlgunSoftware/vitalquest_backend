const { Pool } = require('pg');

// PostgreSQL connection pool
// Railway DATABASE_URL varsa onu kullan, yoksa ayrı ayrı değişkenlerden al
const pool = new Pool(
  process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

pool.on('connect', () => {
  console.log('✓ PostgreSQL veritabanına bağlandı');
});

pool.on('error', (err) => {
  console.error('PostgreSQL bağlantı hatası:', err);
  process.exit(-1);
});

module.exports = pool;

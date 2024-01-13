const { Pool } = require('pg');
require('dotenv').config();

DATABASE_URL=ppostgres://[user]:[password]@[neon_hostname]/[dbname]?options=endpoint%3D[endpoint_id]

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
});

async function getPostgresVersion() {
  const client = await pool.connect();
  try {
    const response = await client.query('SELECT version()');
    console.log(response.rows[0]);
  } finally {
    client.release();
  }
}

getPostgresVersion();
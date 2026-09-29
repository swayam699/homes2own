const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  multipleStatements: true,
};

async function initMySQL() {
  console.log('--- Initializing MySQL Database ---');
  console.log(`Connecting to MySQL host: ${DB_CONFIG.host}:${DB_CONFIG.port} with user: ${DB_CONFIG.user}...`);

  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    console.log('Connected to MySQL server.');

    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('Executing schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('Schema created successfully.');
    } else {
      console.warn(`schema.sql not found at ${schemaPath}`);
    }

    if (fs.existsSync(seedPath)) {
      console.log('Executing seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('Seed data inserted successfully.');
    } else {
      console.warn(`seed.sql not found at ${seedPath}`);
    }

    await connection.end();
    console.log('MySQL initialization completed successfully!');
  } catch (error) {
    console.error('MySQL initialization failed:', error.message);
    console.log('Note: If running in development without a local MySQL password, the app will automatically use embedded SQLite.');
  }
}

initMySQL();

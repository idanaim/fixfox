const { DataSource } = require('typeorm');
require('dotenv').config(); // Load environment variables from .env file

module.exports = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    'dist/**/*.entity.js', // Use .js files in dist for production
    'dist/admin/entities/*.entity.js',
    'dist/ai-solutions/entities/*.entity.js'
  ],
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
  cli: {
    migrationsDir: 'src/migrations'
  },
  ssl: false,
  extra: {
    ssl: false
  },
  options: '-c ssl=false'
});

const { DataSource } = require('typeorm');
require('dotenv').config(); // Load environment variables from .env file

module.exports = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'fixfox_user',
  password: '12345',
  database: 'fixfox_db',
  entities: [
    'src/**/*.entity.ts',
    'src/admin/entities/*.entity.ts',
    'src/ai-solutions/entities/*.entity.ts'
  ],
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
  cli: {
    migrationsDir: 'src/migrations'
  }
});

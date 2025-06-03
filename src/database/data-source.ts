import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: process.env.DB_CONNECTION as 'postgres' | 'mysql' | 'mariadb',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity.js'],
  migrations: [__dirname + '/migrations/**.js'],
  synchronize: false,
});

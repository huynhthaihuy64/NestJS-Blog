import { DataSourceOptions, DataSource } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 33087,
  username: 'root',
  password: '12345678',
  database: 'blog',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  synchronize: false
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
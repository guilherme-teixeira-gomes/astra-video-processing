import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Video } from "../entities/Video";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "fiapx",
  entities: [User, Video],
  synchronize: true,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

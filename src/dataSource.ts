import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config();

export const PostgresDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  logging: true,
  // synchronize: true,
  entities: [Post, User],
  migrations: [path.join(__dirname, "./migrations/*")],
  connectTimeoutMS: 0,
  ssl: false,
});

import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

type config = Parameters<typeof MikroORM.init>[0];

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
  },
  entities: [Post, User],
  dbName: "zameal",
  user: "postgres",
  password: "postgres",
  type: "postgresql",
  debug: !__prod__,
} as config;

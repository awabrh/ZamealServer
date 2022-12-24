import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { myContext } from "./types";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import * as dotenv from "dotenv";
dotenv.config();

const main = async () => {
  const conn = new DataSource({
    type: "postgres",
    url: process.env.POSTGRES_URL,
    logging: true,
    synchronize: true,
    entities: [Post, User],
    connectTimeoutMS: 0,
    ssl: false,
  });

  await conn.initialize().catch((error) => console.log(error));

  const app = express();
  const port = process.env.PORT || "4000";

  // Post.delete({});
  // User.delete({});

  let RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL as string);

  app.use(
    cors({
      origin: process.env.ORIGIN,
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: process.env.SECRET || "",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): myContext => ({ req, res, redis }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    cache: "bounded",
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.get("/", (_, res) => {
    res.send("root");
  });

  app.listen(port, () => {
    console.log(`server started on localhost:${port}`);
    console.log("allowed origin:", process.env.ORIGIN);
  });
};

main().catch((err) => {
  console.log(err);
});

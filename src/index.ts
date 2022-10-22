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

const main = async () => {
  const conn = new DataSource({
    type: "postgres",
    database: "zameal2",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [Post, User],
  });

  await conn.initialize().catch((error) => console.log(error));

  const app = express();

  let RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: "http://localhost:3000",
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
      secret: "ksjhdkfjhkjshfhks",
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
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.get("/", (_, res) => {
    res.send("root");
  });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => {
  console.log(err);
});

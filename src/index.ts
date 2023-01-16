import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME, __prod__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { myContext } from "./types";
import { PostgresDataSource } from "./dataSource";

const main = async () => {
  await PostgresDataSource.initialize().catch((error) => console.log(error));
  await PostgresDataSource.runMigrations();

  const app = express();
  const port = process.env.PORT || "4000";

  // Post.delete({});
  // User.delete({});

  let RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL as string);
  app.set("proxy", 1);
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
        secure: __prod__,
        sameSite: "lax",
        domain: __prod__ ? ".zameal.com" : undefined,
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

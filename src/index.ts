import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);

  orm.getMigrator().up();

  const emFork = orm.em.fork();

  const post = emFork.create(Post, { title: "my second post" });
  await emFork.persistAndFlush(post);
  const posts = await emFork.find(Post, {});
  console.log(posts);
};

main().catch((err) => {
  console.log(err);
});

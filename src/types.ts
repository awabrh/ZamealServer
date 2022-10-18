import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

export type myContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
};

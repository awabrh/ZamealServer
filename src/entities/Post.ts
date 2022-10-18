import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt?: Date = new Date();

  @Field(() => String)
  @Property({ onUpdate: () => new Date(), type: "date" })
  updatedAt?: Date = new Date();

  @Field()
  @Property({ type: "text" })
  title!: string;
}

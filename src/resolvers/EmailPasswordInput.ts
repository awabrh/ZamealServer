import { InputType, Field } from "type-graphql";

@InputType()
export class EmailPasswordInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

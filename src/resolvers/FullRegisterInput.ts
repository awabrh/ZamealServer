import { InputType, Field } from "type-graphql";

@InputType()
export class FullRegisterInput {
  @Field()
  name: string;

  @Field()
  dep: string;

  @Field()
  batch: string;

  @Field()
  address: string;

  @Field()
  gender: string;

  @Field()
  mobile: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

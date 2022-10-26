import { InputType, Field } from "type-graphql";

@InputType()
export class AddTarheelInput {
  @Field()
  carModel: string;

  @Field()
  numberOfSeats: 1 | 2 | 3 | 4;

  @Field()
  isAcWorking: boolean;

  @Field()
  locations: string;

  @Field()
  price?: number;

  @Field()
  departure: string;

  @Field()
  arrival: string;

  @Field(() => [String])
  days: string[];
}

import { Post } from "../entities/Post";
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Field,
  ObjectType,
  Ctx,
} from "type-graphql";
import { FieldError } from "./FieldError";
import { AddTarheelInput } from "./AddTarheelInput";
import { myContext } from "src/types";
import argon2 from "argon2";

@ObjectType()
class PostResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Post, { nullable: true })
  post?: Post;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | null> {
    return Post.findOneBy({ id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("formInput") formInput: AddTarheelInput,
    @Ctx() { req }: myContext
  ): Promise<PostResponse> {
    let post;

    try {
      post = await Post.create({
        carModel: formInput.carModel,
        numberOfSeats: formInput.numberOfSeats,
        isAcWorking: formInput.isAcWorking,
        locations: formInput.locations,
        price: formInput.price,
        departure: formInput.departure,
        arrival: formInput.arrival,
        days: formInput.days.join(", "),
      }).save();
    } catch (error) {
      return {
        errors: [
          {
            field: "locations",
            message: "unknown error",
          },
        ],
      };
    }

    return {
      post,
    };
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ id });
    if (!post) {
      return null;
    }
    // if (typeof title !== "undefined") {
    //   post.title = title;
    //   await Post.update({ id }, { title: title });
    // }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    try {
      await Post.delete({ id });
      return true;
    } catch (error) {
      return false;
    }
  }
}

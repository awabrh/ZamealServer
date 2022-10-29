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
import { User } from "../entities/User";

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
  async posts(): Promise<Post[]> {
    const posts = Post.find({ relations: { user: true } });
    // console.log(await posts);
    return posts;
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id") id: number): Promise<Post | null> {
    const post = await Post.findOne({
      where: { id: id },
      relations: { user: true },
    });
    console.log(post?.user);
    return post;
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("formInput") formInput: AddTarheelInput,
    @Ctx() { req }: myContext
  ): Promise<Post | null> {
    let post;
    let user: User | null;

    // try {
    user = await User.findOneBy({ id: req.session.userId });
    // } catch (error) {
    //   return {
    //     errors: [
    //       {
    //         field: "name",
    //         message: "unknown error",
    //       },
    //     ],
    //   };
    // }

    try {
      post = Post.create({
        imageId: formInput.imageId,
        carModel: formInput.carModel,
        numberOfSeats: formInput.numberOfSeats,
        isAcWorking: formInput.isAcWorking,
        locations: formInput.locations,
        price: formInput.price,
        departure: formInput.departure,
        arrival: formInput.arrival,
        days: formInput.days.join(", "),
        user: user ? user : undefined,
      }).save();
    } catch (error) {
      return null;
      // return {
      //   errors: [
      //     {
      //       field: "carModel",
      //       message: "unknown error",
      //     },
      //   ],
      // };
    }

    console.log(post);

    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(@Arg("id") id: number): Promise<Post | null> {
    const post = await Post.findOneBy({ id });
    if (!post) {
      return null;
    }
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

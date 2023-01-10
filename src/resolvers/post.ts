import { Post } from "../entities/Post";
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  // Field,
  // ObjectType,
  Ctx,
  Int,
} from "type-graphql";
// import { FieldError } from "./FieldError";
import { AddTarheelInput } from "./AddTarheelInput";
import { myContext } from "src/types";
import { User } from "../entities/User";
import { FindOptionsWhere, LessThan, Like } from "typeorm";

// @ObjectType()
// class PostResponse {
//   @Field(() => [FieldError], { nullable: true })
//   errors?: FieldError[];

//   @Field(() => Post, { nullable: true })
//   post?: Post;
// }

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number | null,
    @Arg("location", { nullable: true }) location: string
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit);
    let posts;
    var whereClause:
      | FindOptionsWhere<Post>
      | FindOptionsWhere<Post>[]
      | undefined;
    var skipClause: number | undefined;
    if (location) {
      whereClause = { ...whereClause, locations: Like(`%${location}%`) };
    }

    if (offset) {
      skipClause = offset;
    }

    posts = Post.find({
      where: whereClause,
      relations: { user: true },
      order: {
        updatedAt: "DESC",
      },
      skip: skipClause,
      take: realLimit,
    });

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

    try {
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
    } catch (error) {
      console.log(error);
      return null;
    }

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
      console.log(error);
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
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { req }: myContext
  ): Promise<boolean> {
    try {
      const user = await User.findOne({
        where: { id: req.session.userId },
        relations: { post: true },
      });
      if (user && user.post?.id === id) {
        await Post.delete({ id });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}

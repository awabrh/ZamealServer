import { myContext } from "src/types";
import { User } from "../entities/User";
import {
  Resolver,
  Mutation,
  Query,
  Arg,
  InputType,
  Field,
  Ctx,
  ObjectType,
} from "type-graphql";
import argon2 from "argon2";

@InputType()
class EmailPasswordInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: myContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: EmailPasswordInput,
    @Ctx() { em, req }: myContext
  ): Promise<UserResponse> {
    if (options.email.length <= 2) {
      return {
        errors: [
          {
            field: "email",
            message: "Email cannot be shorter than 2 letters",
          },
        ],
      };
    }

    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "Password cannot be shorter than 2 letters",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);

    const user = em.create(User, {
      email: options.email.toLowerCase(),
      password: hashedPassword,
    });

    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "email",
              message: "Account already exists",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;

    return {
      user: user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: EmailPasswordInput,
    @Ctx() { em, req }: myContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { email: options.email });
    if (!user) {
      return {
        errors: [
          {
            field: "email",
            message: "This account doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Invalid Password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user: user,
    };
  }
}

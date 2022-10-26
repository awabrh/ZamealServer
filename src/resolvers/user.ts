import { myContext } from "src/types";
import { User } from "../entities/User";
import {
  Resolver,
  Mutation,
  Query,
  Arg,
  Field,
  Ctx,
  ObjectType,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { EmailPasswordInput } from "./EmailPasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { FieldError } from "./FieldError";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: myContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password cannot be shorter than 2 letters",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const id = parseInt(userId);
    const user = await User.findOneBy({ id: id });

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(newPassword);
    await User.update({ id: id }, { password: hashedPassword });

    await redis.del(key);

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: myContext
  ) {
    const user = await User.findOneBy({ email: email });
    if (!user) {
      return true;
    }

    const token = v4();

    redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "EX",
      1000 * 60 * 60 * 24 * 3
    );

    sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: myContext) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne({
      where: { id: req.session.userId },
      relations: { post: true },
    });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: EmailPasswordInput,
    @Ctx() { req }: myContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    let user;

    try {
      user = await User.create({
        email: options.email.toLowerCase(),
        password: hashedPassword,
      }).save();
    } catch (err) {
      console.log(err);
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "email",
              message: "Account already exists",
            },
          ],
        };
      } else {
        return {
          errors: [
            {
              field: "email",
              message: "Unknown server error",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;
    console.log(user);

    return {
      user: user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: EmailPasswordInput,
    @Ctx() { req }: myContext
  ): Promise<UserResponse> {
    const user = await User.findOneBy({ email: options.email });
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

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: myContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}

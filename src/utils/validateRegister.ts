import { EmailPasswordInput } from "src/resolvers/EmailPasswordInput";

export function validateRegister(options: EmailPasswordInput) {
  if (options.email.length <= 2) {
    return [
      {
        field: "email",
        message: "Email cannot be shorter than 2 letters",
      },
    ];
  }

  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Email must include an @",
      },
    ];
  }

  if (options.password.length <= 2) {
    return [
      {
        field: "password",
        message: "Password cannot be shorter than 2 letters",
      },
    ];
  }

  return null;
}

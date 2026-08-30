import { UserPasswordDefinition } from "#/controller/user/user.schema";
import { it, expect, describe } from "vitest";

const passwordSchemaTests = [
  {
    password: "ValidPass123!",
    expected: true,
  },
  {
    password: "short",
    expected: false,
  },
  {
    password: "nouppercase123!",
    expected: false,
  },
  {
    password: "NOLOWERCASE123!",
    expected: false,
  },
  {
    password: "NoNumber!",
    expected: false,
  },
  {
    password: "NoSpecialChar123",
    expected: false,
  },
  {
    password: "ThisPasswordIsWayTooLong123!",
    expected: false,
  },
  {
    password: "ValidPass123!",
    expected: true,
  },
  {
    password: "Another$Valid1",
    expected: true,
  },
  {
    password: "InvalidPasswordWithoutSpecialChar1",
    expected: false,
  },
  {
    password: "InvalidPasswordWithoutNumber!",
    expected: false,
  },
  {
    password: "invalidpasswordwithoutuppercase1!",
    expected: false,
  },
  {
    password: "INVALIDPASSWORDWITHOUTLOWERCASE1!",
    expected: false,
  },
];

describe("User Password Schema Validation", () => {
  it.each(passwordSchemaTests)(
    "should validate password '%password' => %expected",
    ({ password, expected }) => {
      const isValid = UserPasswordDefinition.safeParse(password).success;
      expect(isValid).toBe(expected);
    },
  );
});

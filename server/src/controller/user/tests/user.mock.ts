import type { User } from "#/generated/prisma/client";
import bcrypt from "bcrypt";

const fakeUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  password: bcrypt.hashSync("ValidPass123!", 12),
  epithet: null,
  role: "USER",
  profileImage: null,
  backgroundImage: null,
  isActive: true,
  deactivateReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies User;

export default fakeUser;

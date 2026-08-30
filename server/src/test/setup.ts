import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { db } from "#/lib/prisma";

vi.mock("#/lib/prisma", () => ({
  db: mockDeep<typeof db>(),
}));

beforeEach(() => {
  mockReset(db);
});

export const mockedDb = db as unknown as ReturnType<typeof mockDeep<typeof db>>;

import Presigner from "#/controller/storage/presigner";
import UserError from "#/lib/router/http/userError";
import { beforeAll, describe, expect, it } from "vitest";

const constraint = { maxBytes: 1024, contentTypes: ["image/png"] } as const;
const key = "avatars/user-1/abc.png";

beforeAll(() => {
  process.env.S3_ENDPOINT = "http://localhost:3900";
  process.env.S3_REGION = "garage";
  process.env.S3_BUCKET = "cude";
  process.env.S3_PUBLIC_URL = "http://cude.localhost:3902";
  process.env.S3_ACCESS_KEY = "GKtestaccesskey";
  process.env.S3_SECRET_KEY = "testsecretkey";
});

describe("Presigner.upload", () => {
  it("returns presigned url + public url for public content", async () => {
    const res = await new Presigner().upload({
      key,
      contentType: "image/png",
      size: 100,
      public: true,
      constraint,
    });

    expect(res.presignedUrl).toContain("http://localhost:3900/cude/");
    expect(res.presignedUrl).toContain("X-Amz-Signature=");
    expect(decodeURIComponent(res.presignedUrl)).toContain("content-length");
    expect(res.publicUrl).toBe(`http://cude.localhost:3902/${key}`);
    expect(res.expiresIn).toBe(300);
    expect(res.constraint).toEqual(constraint);
  });

  it("omits public url for private content", async () => {
    const res = await new Presigner().upload({
      key,
      contentType: "image/png",
      size: 100,
      public: false,
      constraint,
    });

    expect(res.publicUrl).toBeUndefined();
  });

  it("rejects size above the constraint", async () => {
    await expect(
      new Presigner().upload({
        key,
        contentType: "image/png",
        size: 2048,
        public: true,
        constraint,
      }),
    ).rejects.toThrow(UserError);
  });

  it("rejects contentType outside the constraint", async () => {
    await expect(
      new Presigner().upload({
        key,
        contentType: "image/gif",
        size: 100,
        public: true,
        constraint,
      }),
    ).rejects.toThrow("contentType not allowed");
  });
});

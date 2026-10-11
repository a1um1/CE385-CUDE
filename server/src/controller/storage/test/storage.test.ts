import StorageController from "#/controller/storage";
import UserError from "#/lib/router/http/userError";
import { beforeAll, describe, expect, it } from "vitest";

const userId = "user-uuid-1";

beforeAll(() => {
  process.env.S3_ENDPOINT = "http://localhost:3900";
  process.env.S3_REGION = "garage";
  process.env.S3_BUCKET = "cude";
  process.env.S3_PUBLIC_URL = "http://cude.localhost:3902";
  process.env.S3_ACCESS_KEY = "GKtestaccesskey";
  process.env.S3_SECRET_KEY = "testsecretkey";
});

describe("StorageController.presignUpload", () => {
  it("returns presigned PUT + public access url", async () => {
    const res = await StorageController.presignUpload(userId, {
      purpose: "avatar",
      contentType: "image/png",
      size: 1234,
    });

    expect(res.key).toMatch(new RegExp(`^avatars/${userId}/[0-9a-f-]{36}\\.png$`));
    expect(res.uploadUrl).toContain("http://localhost:3900/cude/");
    expect(res.uploadUrl).toContain("X-Amz-Signature=");
    // exact size + type are signed into the URL
    expect(decodeURIComponent(res.uploadUrl)).toContain("content-length");
    expect(decodeURIComponent(res.uploadUrl)).toContain("content-type");
    expect(res.accessUrl).toBe(`http://cude.localhost:3902/${res.key}`);
    expect(res.expiresIn).toBe(300);
  });

  it("rejects size above the purpose cap", async () => {
    await expect(
      StorageController.presignUpload(userId, {
        purpose: "avatar",
        contentType: "image/png",
        size: 3 * 1024 * 1024,
      }),
    ).rejects.toThrow(UserError);
  });

  it("rejects contentType outside the allowlist", async () => {
    await expect(
      StorageController.presignUpload(userId, {
        purpose: "avatar",
        contentType: "image/gif",
        size: 100,
      }),
    ).rejects.toThrow("contentType not allowed");
  });
});

import "dotenv/config";
import type {
  PresignUploadRequestSchema,
  PresignUploadResponseSchema,
  StoragePurposeSchema,
} from "#/controller/storage/storage.schema";
import UserError from "#/lib/router/http/userError";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

const UPLOAD_EXPIRES_IN = 300;

interface StoragePurpose {
  prefix: string;
  maxBytes: number;
  contentTypes: readonly string[];
}

// General-purpose bucket (`cude`); purposes only map to prefix + limits.
// New use case = one entry here.
const PURPOSES: Record<StoragePurposeSchema, StoragePurpose> = {
  avatar: {
    prefix: "avatars",
    maxBytes: 2 * 1024 * 1024,
    contentTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  thumbnail: {
    prefix: "thumbnails",
    maxBytes: 5 * 1024 * 1024,
    contentTypes: ["image/png", "image/jpeg", "image/webp"],
  },
};

let client: S3Client | undefined = undefined;

function getS3(): S3Client {
  client ??= new S3Client({
    region: process.env.S3_REGION ?? "garage",
    endpoint: process.env.S3_ENDPOINT ?? "http://localhost:3900",
    forcePathStyle: true,
    // SDK default injects x-amz-checksum-crc32 into presigned URLs; Garage
    // validates it against the body and always fails. No checksum = no problem.
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? "",
      secretAccessKey: process.env.S3_SECRET_KEY ?? "",
    },
  });
  return client;
}

const bucket = () => process.env.S3_BUCKET ?? "cude";
const publicUrl = () => process.env.S3_PUBLIC_URL ?? "http://cude.localhost:3902";

// controllers here are classes by convention
// oxlint-disable-next-line no-extraneous-class
export default class StorageController {
  static async presignUpload(
    userId: string,
    input: PresignUploadRequestSchema,
  ): Promise<PresignUploadResponseSchema> {
    const purpose = PURPOSES[input.purpose];

    if (!purpose.contentTypes.includes(input.contentType)) {
      throw new UserError(400, `contentType not allowed for purpose '${input.purpose}'`);
    }
    if (input.size > purpose.maxBytes) {
      throw new UserError(400, `File too large: max ${purpose.maxBytes} bytes`);
    }

    // extension = media subtype: image/png -> png
    const ext = input.contentType.slice(input.contentType.indexOf("/") + 1);
    const key = `${purpose.prefix}/${userId}/${randomUUID()}.${ext}`;

    const uploadUrl = await getSignedUrl(
      getS3(),
      new PutObjectCommand({
        Bucket: bucket(),
        Key: key,
        ContentLength: input.size,
        ContentType: input.contentType,
      }),
      {
        expiresIn: UPLOAD_EXPIRES_IN,
        // exact-size enforcement: body must match the signed length or SigV4 fails
        signableHeaders: new Set(["content-length", "content-type"]),
      },
    );

    return {
      key,
      uploadUrl,
      accessUrl: `${publicUrl()}/${key}`,
      expiresIn: UPLOAD_EXPIRES_IN,
    };
  }
}

import { bucket, getS3, publicUrl } from "#/controller/storage/s3";
import UserError from "#/lib/router/http/userError";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface UploadConstraint {
  maxBytes: number; // Maximum allowed file size in bytes
  contentTypes: readonly string[]; // Allowed MIME types for the upload
}

export interface PresignUploadInput {
  key: string; // The S3 object key (path) where the file will be stored
  contentType: string; // The MIME type of the file being uploaded
  size: number;
  public: boolean; // Whether the uploaded file should be publicly accessible
  constraint: UploadConstraint;
}

export interface PresignUploadResult {
  presignedUrl: string;
  publicUrl?: string;
  expiresIn: number;
  constraint: UploadConstraint; // The constraints that were applied to the upload, useful for client-side validation
}

/**
 * Generates presigned PUT urls for the Garage S3 bucket.
 * Not wired into any route yet.
 */
export default class Presigner {
  private readonly expiresIn: number;

  constructor(expiresIn = 300) {
    this.expiresIn = expiresIn;
  }

  async upload(input: PresignUploadInput): Promise<PresignUploadResult> {
    if (!input.constraint.contentTypes.includes(input.contentType)) {
      throw new UserError(
        400,
        `contentType not allowed. Allowed: ${input.constraint.contentTypes.join(", ")}`,
      );
    }
    if (input.size > input.constraint.maxBytes) {
      throw new UserError(400, `File too large: max ${input.constraint.maxBytes} bytes`);
    }

    const presignedUrl = await getSignedUrl(
      getS3(),
      new PutObjectCommand({
        Bucket: bucket(),
        Key: input.key,
        ContentLength: input.size,
        ContentType: input.contentType,
      }),
      {
        expiresIn: this.expiresIn,
        // exact-size enforcement: body must match the signed length or SigV4 fails
        signableHeaders: new Set(["content-length", "content-type"]),
      },
    );

    return {
      presignedUrl,
      ...(input.public ? { publicUrl: `${publicUrl()}/${input.key}` } : {}),
      expiresIn: this.expiresIn,
      constraint: input.constraint,
    };
  }
}

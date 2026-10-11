import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";

let client: S3Client | undefined = undefined;

export function getS3(): S3Client {
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

export const bucket = () => process.env.S3_BUCKET ?? "cude";
export const publicUrl = () => process.env.S3_PUBLIC_URL ?? "http://cude.localhost:3902";

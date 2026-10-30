// Configure bucket CORS so the browser client can send cross-origin PUT/GET
// directly to the Garage S3 API. Defaults to localhost dev; override with
// S3_ENDPOINT + PUBLIC_ORIGINS for a deployed instance.
// Run from repo root: node scripts/garage-cors.mjs
import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

process.loadEnvFile("scripts/.env.local");

const accessKeyId = process.env.GARAGE_ACCESS_KEY;
const secretAccessKey = process.env.GARAGE_SECRET_KEY;
if (!accessKeyId || !secretAccessKey) {
  console.error("GARAGE_ACCESS_KEY / GARAGE_SECRET_KEY missing in scripts/.env.local");
  process.exit(1);
}

// Override for remote deployments: S3_ENDPOINT=https://s3-cude.m3ow.xyz PUBLIC_ORIGINS=https://app.example.com
// shortcut: Garage joins multiple origins into one invalid header, so only a single
// value (or "*") works — presigned uploads send no cookies, so "*" is safe here.
const origins = (process.env.PUBLIC_ORIGINS ?? "*").split(",");

const s3 = new S3Client({
  region: "garage",
  endpoint: process.env.S3_ENDPOINT ?? "http://localhost:3900",
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});

await s3.send(
  new PutBucketCorsCommand({
    Bucket: process.env.GARAGE_BUCKET ?? "cude",
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: origins,
          AllowedMethods: ["GET", "PUT", "HEAD", "OPTIONS"],
          AllowedHeaders: ["*"],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }),
);

console.log("garage bucket CORS configured");

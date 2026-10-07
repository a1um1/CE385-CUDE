// Configure bucket CORS so the browser client (localhost:5173) can send
// cross-origin PUT/GET directly to the Garage S3 API (localhost:3900).
// Run from repo root after garage is up: node scripts/garage-cors.mjs
import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

process.loadEnvFile("scripts/.env.local");

const accessKeyId = process.env.GARAGE_ACCESS_KEY;
const secretAccessKey = process.env.GARAGE_SECRET_KEY;
if (!accessKeyId || !secretAccessKey) {
  console.error("GARAGE_ACCESS_KEY / GARAGE_SECRET_KEY missing in scripts/.env.local");
  process.exit(1);
}

const s3 = new S3Client({
  region: "garage",
  endpoint: "http://localhost:3900",
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});

await s3.send(
  new PutBucketCorsCommand({
    Bucket: process.env.GARAGE_BUCKET ?? "cude",
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: ["http://localhost:5173", "http://localhost:3000"],
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

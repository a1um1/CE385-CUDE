import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "../../server/src/generated/prisma/client";

config({ path: path.resolve(import.meta.dirname, "../../server/.env") });

const { DATABASE_URL, SEED_ADMIN_PASSWORD } = process.env;

if (!DATABASE_URL) throw new Error("Missing DATABASE_URL in .env");
if (!SEED_ADMIN_PASSWORD) throw new Error("Missing SEED_ADMIN_PASSWORD in .env");

export const CONTENT_ROOT = path.resolve(import.meta.dirname, "data");
export const ADMIN_PASSWORD = SEED_ADMIN_PASSWORD;

export const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });

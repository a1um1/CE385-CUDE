import type { Unit, Prisma } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import {
  createCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination.schema";
import type zod from "zod";

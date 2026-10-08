import type { z as ZodType } from "zod";
import { z } from "#/lib/extendZod";
import UserError from "#/lib/router/http/userError";

/** Shared `?include=` query schema: comma-separated string or repeated keys. */
export const includeQuerySchema = z.object({
  include: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .openapi({
      description: "Comma-separated relations to include, e.g. unit.course",
      example: "unit.course",
    }),
});

export type IncludeQuery = ZodType.infer<typeof includeQuerySchema>;

/**
 * Build a nested Prisma include object from dotted paths.
 *
 * buildInclude(["unit", "unit.course"]) => { unit: { include: { course: true } } }
 * Order of paths does not matter.
 */
export function buildInclude(paths: string[]): Record<string, unknown> {
  const include: Record<string, unknown> = {};

  for (const path of paths) {
    const parts = path.split(".");
    let node = include;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i] as string;
      const existing = node[part];
      if (typeof existing !== "object" || existing === null) {
        node[part] = { include: {} };
      }
      node = (node[part] as { include: Record<string, unknown> }).include;
    }

    const leaf = parts[parts.length - 1] as string;
    if (!(leaf in node)) node[leaf] = true;
  }

  return include;
}

/**
 * Parse a raw `?include=` value against an allow-list of dotted paths,
 * then build the Prisma include object.
 *
 * Returns undefined when nothing was requested so callers can pass the
 * result straight to Prisma (`include: undefined` === no include).
 */
export function resolveInclude<T>(
  raw: string | string[] | undefined,
  allowed: readonly string[],
): T | undefined {
  if (raw === undefined) return undefined;

  const keys = (Array.isArray(raw) ? raw : [raw])
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (keys.length === 0) return undefined;

  for (const key of keys) {
    if (!allowed.includes(key)) {
      throw new UserError(400, `Invalid include "${key}". Allowed: ${allowed.join(", ")}`);
    }
  }

  return buildInclude(keys) as T;
}

import { z } from "#/lib/extendZod";
import UserError from "#/lib/router/http/userError";

/**
 * Build a per-entity `?include=` query schema from its allow-list.
 *
 * Accepts a single path or repeated keys, so the generated OpenAPI type is
 * `"unit" | "unit.course" | ("unit" | "unit.course")[]`.
 */
export function createIncludeQuerySchema<T extends readonly [string, ...string[]]>(
  paths: T,
  title: string,
) {
  return z
    .object({
      include: z
        .union([z.enum(paths), z.array(z.enum(paths))])
        .optional()
        .openapi({
          description: `Relations to include. Allowed: ${paths.join(", ")}`,
          example: paths[0],
        }),
    })
    .openapi(title);
}

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
    if (!allowed.includes(key)) throw new UserError(400, `Invalid include "${key}"`);
  }

  return buildInclude(keys) as T;
}

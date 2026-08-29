import type { logStatus } from "#/generated/prisma/enums";
import { db } from "#/lib/prisma";

function saveLog(content: string, status: logStatus): void {
  Promise.resolve(
    db.log.create({
      data: {
        content,
        status,
      },
    }),
  ).catch(() => {
    // Non-blocking fire-and-forget: catch any unexpected errors to prevent breaking caller
  });
}
export { saveLog };

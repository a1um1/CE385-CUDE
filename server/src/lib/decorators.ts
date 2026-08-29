import { logStatus } from "#/generated/prisma/enums";
import { db } from "#/lib/prisma";

export function Log<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
): void | ((this: This, ...args: Args) => Return);

export function Log(
  label?: string,
): <This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) => (this: This, ...args: Args) => Return;

export function Log<This, Args extends unknown[], Return>(...args: unknown[]): any {
  // Decorator factory when called as @Log
  if (
    typeof args[0] === "function" &&
    args[1] &&
    typeof args[1] === "object" &&
    "kind" in args[1]
  ) {
    const target = args[0] as (this: This, ...args: Args) => Return;
    const context = args[1] as ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >;
    return wrapStage3Method(target, context);
  }

  // Decorator factory when called as @Log() or @Log("Custom Label")
  const customLabel = typeof args[0] === "string" ? args[0] : undefined;
  return function logDecoratorFactory(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  ) {
    return wrapStage3Method(target, context, customLabel);
  };
}

function saveLog(content: string, status: logStatus): void {
  db.log
    .create({
      data: {
        content,
        status,
      },
    })
    .catch(() => {
      // Non-blocking fire-and-forget: catch database logging errors to prevent breaking caller
    });
}

function wrapStage3Method<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  customLabel?: string,
) {
  const methodName = String(context.name);

  return function loggedStage3Method(this: This, ...args: Args): Return {
    const className =
      (context.static
        ? (this as { name?: string })?.name
        : (this as { constructor?: { name?: string } })?.constructor?.name) || "AnonymousClass";

    const label = customLabel || `${className}.${methodName}`;
    const startTime = performance.now();

    try {
      const result = target.apply(this, args);

      if (
        result instanceof Promise ||
        (result !== null &&
          typeof result === "object" &&
          typeof (result as unknown as { then?: unknown }).then === "function")
      ) {
        return (result as unknown as Promise<unknown>)
          .then((resolvedValue) => {
            const duration = Math.round(performance.now() - startTime);
            saveLog(`${label} executed in ${duration}ms`, logStatus.SUCCESS);
            return resolvedValue;
          })
          .catch((error: unknown) => {
            const duration = Math.round(performance.now() - startTime);
            const errorMessage = error instanceof Error ? error.message : String(error);
            saveLog(`${label} failed in ${duration}ms: ${errorMessage}`, logStatus.ERROR);
            throw error;
          }) as Return;
      }

      const duration = Math.round(performance.now() - startTime);
      saveLog(`${label} executed in ${duration}ms`, logStatus.SUCCESS);
      return result;
    } catch (error: unknown) {
      const duration = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : String(error);
      saveLog(`${label} failed in ${duration}ms: ${errorMessage}`, logStatus.ERROR);
      throw error;
    }
  };
}

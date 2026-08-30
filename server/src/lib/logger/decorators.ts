import { logStatus } from "#/generated/prisma/enums";
import { saveLog } from "#/lib/logger/saveLog";

export function Log(label?: string) {
  return (
    _target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const original = descriptor?.value;

    if (typeof original !== "function") {
      throw new Error(`@Log can only decorate methods. "${String(propertyKey)}" is not a method.`);
    }

    descriptor.value = async function value(this: unknown, ...args: unknown[]) {
      const className = resolveClassName(this);
      const methodLabel = label || `${className}.${String(propertyKey)}`;
      const startTime = performance.now();

      const logSuccess = () => {
        saveLog(`${methodLabel} executed in ${elapsed(startTime)}ms`, logStatus.SUCCESS);
      };

      const logFailure = (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        saveLog(`${methodLabel} failed in ${elapsed(startTime)}ms: ${message}`, logStatus.ERROR);
      };

      try {
        const result = original.apply(this, args);

        if (isPromiseLike(result)) {
          return (result as Promise<unknown>).then(
            (return_value) => {
              logSuccess();
              return return_value;
            },
            (error: unknown) => {
              logFailure(error);
              throw error;
            },
          );
        }

        logSuccess();
        return result;
      } catch (error) {
        logFailure(error);
        throw error;
      }
    };

    return descriptor;
  };
}

export function resolveClassName(instance: unknown): string {
  const ctorName = (instance as { constructor?: { name?: string } })?.constructor?.name;
  return ctorName || "AnonymousClass";
}

export function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    value instanceof Promise ||
    (typeof value === "object" && value !== null && typeof (value as any).then === "function")
  );
}

function elapsed(startTime: number): number {
  return Math.round(performance.now() - startTime);
}

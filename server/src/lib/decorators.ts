function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace("T", " ").substring(0, 19);
}

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

  // Decorator factory when called as @Log()
  return function logDecoratorFactory(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  ) {
    return wrapStage3Method(target, context);
  };
}

function wrapStage3Method<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const methodName = String(context.name);

  return function loggedStage3Method(this: This, ...args: Args): Return {
    const className =
      (context.static
        ? (this as { name?: string })?.name
        : (this as { constructor?: { name?: string } })?.constructor?.name) || "AnonymousClass";

    const callerName = `${className}.${methodName}`;
    console.log(`[${getTimestamp()}] [${callerName}] called`);

    return target.apply(this, args);
  };
}

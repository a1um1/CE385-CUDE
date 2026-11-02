import { describe, expect, it } from "vitest";
import { normalizeApiValidationErrors, toTanStackFieldPath } from "./apiErrors";

const validationError = (
  details: { path: string; message: string }[],
  message = "Invalid request parameters",
) => ({ message, details });

describe("normalizeApiValidationErrors", () => {
  it("groups flat fields", () => {
    expect(
      normalizeApiValidationErrors(
        validationError([
          { path: "email", message: "Invalid email address" },
          { path: "password", message: "Too short" },
          { path: "password", message: "Needs a number" },
        ]),
      ),
    ).toEqual({
      fields: {
        email: ["Invalid email address"],
        password: ["Too short", "Needs a number"],
      },
      form: undefined,
    });
  });

  it("converts nested paths to TanStack Form syntax", () => {
    expect(
      normalizeApiValidationErrors(
        validationError([{ path: "address.street", message: "Required" }]),
      )?.fields,
    ).toEqual({ "address.street": ["Required"] });
  });

  it("converts array indexes", () => {
    expect(
      normalizeApiValidationErrors(
        validationError([
          { path: "items.0.name", message: "Required" },
          { path: "items.10.price", message: "Must be positive" },
        ]),
      )?.fields,
    ).toEqual({
      "items[0].name": ["Required"],
      "items[10].price": ["Must be positive"],
    });
  });

  it("puts empty-path messages on the form", () => {
    expect(
      normalizeApiValidationErrors(
        validationError([
          { path: "", message: "Something went wrong" },
          { path: "email", message: "Required" },
        ]),
      ),
    ).toEqual({
      fields: { email: ["Required"] },
      form: ["Something went wrong"],
    });
  });

  it("returns null for non-validation errors", () => {
    expect(normalizeApiValidationErrors(new Error("Network down"))).toBeNull();
    expect(normalizeApiValidationErrors({ message: "Internal Server Error" })).toBeNull();
    expect(normalizeApiValidationErrors({ message: "Nope", details: [] })).toBeNull();
    expect(normalizeApiValidationErrors(null)).toBeNull();
    expect(normalizeApiValidationErrors("boom")).toBeNull();
  });
});

describe("toTanStackFieldPath", () => {
  it("leaves plain and dotted paths alone", () => {
    expect(toTanStackFieldPath("email")).toBe("email");
    expect(toTanStackFieldPath("codeExercise.language")).toBe("codeExercise.language");
  });

  it("handles a leading index", () => {
    expect(toTanStackFieldPath("0.name")).toBe("[0].name");
  });
});

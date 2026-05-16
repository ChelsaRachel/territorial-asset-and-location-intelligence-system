import type { ZodSchema } from "zod";

/**
 * Validates raw JSON against a Zod schema, throwing a clear path-aware error on failure.
 * Used by adapters — never import raw mocks directly in components.
 */
export function loadFixture<T>(rawJson: unknown, schema: ZodSchema<T>): T {
  const result = schema.safeParse(rawJson);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue ? issue.path.join(".") || "(root)" : "(unknown)";
    const msg = issue ? issue.message : "Unknown validation error";
    throw new Error(`Fixture validation failed at ${path}: ${msg}`);
  }
  return result.data;
}

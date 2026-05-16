import { describe, it, expect } from "vitest";
import { parseSectionParam, VALID_SECTIONS } from "./intelligenceSection";

describe("parseSectionParam", () => {
  it.each([...VALID_SECTIONS])("accepts uppercase %s", (s) => {
    expect(parseSectionParam(s)).toBe(s);
  });

  it.each([...VALID_SECTIONS])("accepts lowercase %s case-insensitively", (s) => {
    expect(parseSectionParam(s.toLowerCase())).toBe(s);
  });

  it.each([...VALID_SECTIONS])("accepts mixed-case %s case-insensitively", (s) => {
    const mixed = s[0]!.toLowerCase() + s.slice(1);
    expect(parseSectionParam(mixed)).toBe(s);
  });

  it("returns null for an unknown section id", () => {
    expect(parseSectionParam("NOPE")).toBeNull();
    expect(parseSectionParam("A9")).toBeNull();
    expect(parseSectionParam("A0")).toBeNull();
    expect(parseSectionParam("B5")).toBeNull();
  });

  it("returns null for null", () => {
    expect(parseSectionParam(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(parseSectionParam(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseSectionParam("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(parseSectionParam("  ")).toBeNull();
  });
});

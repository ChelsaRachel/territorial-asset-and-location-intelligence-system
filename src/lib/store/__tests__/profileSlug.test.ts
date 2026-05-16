import { describe, it, expect } from "vitest";
import { slugify } from "../profileSlug";

describe("slugify", () => {
  it("converts Kec. Berastagi to berastagi", () => expect(slugify("Kec. Berastagi")).toBe("berastagi"));
  it("converts Kel. Seminyak to seminyak", () => expect(slugify("Kel. Seminyak")).toBe("seminyak"));
  it("converts Kec. Ciwidey to ciwidey", () => expect(slugify("Kec. Ciwidey")).toBe("ciwidey"));
  it("strips diacritics and converts to kebab-case", () => {
    const slug = slugify("Kec. Côte d'Ivoire Élan");
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
  it("lowercases all output", () => {
    const slug = slugify("Kec. UPPER");
    expect(slug).toBe(slug.toLowerCase());
  });
});

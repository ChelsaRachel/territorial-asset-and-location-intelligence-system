import { describe, it, expect } from "vitest";
import {
  formatRp,
  formatRupiahShort,
  formatRpPerM2,
  formatPct,
  formatTon,
  formatRatio,
  formatNdvi,
  formatScore,
  formatTrilyun,
} from "./number";

describe("formatRp", () => {
  it("formats a positive integer", () => {
    expect(formatRp(420000)).toBe("Rp 420.000");
  });

  it("formats zero", () => {
    expect(formatRp(0)).toBe("Rp 0");
  });

  it("formats negative value with sign", () => {
    expect(formatRp(-18500000)).toContain("-");
    expect(formatRp(-18500000)).toContain("Rp");
  });

  it("formats large number", () => {
    const result = formatRp(28500000000);
    expect(result).toContain("Rp");
    expect(result).toContain("28.500.000.000");
  });

  it("handles non-finite", () => {
    expect(formatRp(Infinity)).toBe("—");
    expect(formatRp(NaN)).toBe("—");
  });
});

describe("formatRupiahShort", () => {
  it("formats hundreds of thousands as rb", () => {
    expect(formatRupiahShort(420000)).toBe("Rp 420rb");
  });

  it("formats millions as jt", () => {
    expect(formatRupiahShort(18500000)).toBe("Rp 18,5jt");
  });

  it("formats billions as M", () => {
    const result = formatRupiahShort(2400000000);
    expect(result).toContain("M");
  });

  it("formats small values without suffix", () => {
    expect(formatRupiahShort(500)).toBe("Rp 500");
  });

  it("formats negative values with sign", () => {
    const result = formatRupiahShort(-420000);
    expect(result).toContain("-");
    expect(result).toContain("420rb");
  });

  it("handles zero", () => {
    expect(formatRupiahShort(0)).toBe("Rp 0");
  });

  it("handles non-finite", () => {
    expect(formatRupiahShort(NaN)).toBe("—");
  });

  it("formats trillions as T", () => {
    const result = formatRupiahShort(2400000000000);
    expect(result).toContain("T");
  });
});

describe("formatRpPerM2", () => {
  it("appends /m² suffix", () => {
    expect(formatRpPerM2(420000)).toBe("Rp 420rb/m²");
  });
});

describe("formatPct", () => {
  it("formats positive with + sign", () => {
    expect(formatPct(15.4)).toBe("+15.4%");
  });

  it("formats negative without + sign", () => {
    expect(formatPct(-8.5)).toBe("-8.5%");
  });

  it("formats zero", () => {
    expect(formatPct(0)).toBe("0.0%");
  });

  it("respects decimals parameter", () => {
    expect(formatPct(6.2, 2)).toBe("+6.20%");
  });

  it("handles non-finite", () => {
    expect(formatPct(NaN)).toBe("—");
  });
});

describe("formatTon", () => {
  it("formats positive gap with + sign", () => {
    const result = formatTon(560);
    expect(result).toContain("+");
    expect(result).toContain("560");
    expect(result).toContain("ton/bln");
  });

  it("formats zero", () => {
    const result = formatTon(0);
    expect(result).toContain("0");
  });

  it("accepts custom unit", () => {
    expect(formatTon(100, "kamar/malam")).toContain("kamar/malam");
  });

  it("handles non-finite", () => {
    expect(formatTon(NaN)).toBe("—");
  });
});

describe("formatRatio", () => {
  it("formats ratio to 1 decimal", () => {
    expect(formatRatio(1.4)).toBe("1.4x");
  });

  it("formats zero", () => {
    expect(formatRatio(0)).toBe("0.0x");
  });

  it("handles non-finite", () => {
    expect(formatRatio(Infinity)).toBe("—");
  });
});

describe("formatNdvi", () => {
  it("formats to 3 decimal places", () => {
    expect(formatNdvi(0.72)).toBe("0.720");
    expect(formatNdvi(0.68)).toBe("0.680");
  });
});

describe("formatScore", () => {
  it("formats integer score", () => {
    expect(formatScore(76)).toBe("76");
    expect(formatScore(81)).toBe("81");
  });

  it("rounds decimal scores", () => {
    expect(formatScore(80.9)).toBe("81");
  });
});

describe("formatTrilyun", () => {
  it("formats with T suffix", () => {
    expect(formatTrilyun(15.1)).toBe("15.1T");
  });

  it("handles zero", () => {
    expect(formatTrilyun(0)).toBe("0.0T");
  });
});

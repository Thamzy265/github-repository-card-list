import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatCount,
  formatRelativeTime,
  languageColor,
} from "./github";

describe("formatCount", () => {
  it("returns the raw number below 1,000", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(1)).toBe("1");
    expect(formatCount(999)).toBe("999");
  });

  it("uses one decimal 'k' between 1,000 and 10,000", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(1234)).toBe("1.2k");
    expect(formatCount(9950)).toBe("9.9k");
  });

  it("uses whole-number 'k' between 10,000 and 1,000,000", () => {
    expect(formatCount(10_000)).toBe("10k");
    expect(formatCount(12_345)).toBe("12k");
    expect(formatCount(999_499)).toBe("999k");
  });

  it("uses 'm' at one million and above", () => {
    expect(formatCount(1_000_000)).toBe("1m");
    expect(formatCount(2_500_000)).toBe("2.5m");
  });
});

describe("languageColor", () => {
  it("returns the mapped color for known languages", () => {
    expect(languageColor("TypeScript")).toBe("#3178c6");
    expect(languageColor("Python")).toBe("#3572A5");
  });

  it("returns the neutral fallback for null or unknown languages", () => {
    const fallback = "#8b8b8b";
    expect(languageColor(null)).toBe(fallback);
    expect(languageColor(undefined)).toBe(fallback);
    expect(languageColor("Brainfuck")).toBe(fallback);
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-08T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("picks the largest fitting unit", () => {
    expect(formatRelativeTime("2025-07-08T12:00:00Z")).toBe("1 year ago");
    expect(formatRelativeTime("2026-06-08T12:00:00Z")).toBe("last month");
    expect(formatRelativeTime("2026-07-07T12:00:00Z")).toBe("yesterday");
    expect(formatRelativeTime("2026-07-08T11:30:00Z")).toBe(
      "30 minutes ago",
    );
  });

  it("returns an empty string for unparseable dates", () => {
    expect(formatRelativeTime("not a date")).toBe("");
  });
});

import { describe, expect, it } from "vitest";
import { computeMonthlyContribution, computeProjection } from "../calculations";

describe("computeProjection", () => {
  it("should project growth with positive contributions", () => {
    const result = computeProjection({
      currentAge: 30,
      retirementAge: 65,
      monthlyContribution: 1000,
      currentSavings: 50000,
      annualReturn: 0.07,
      inflationRate: 0.02,
    });

    expect(result).toHaveLength(66); // ages 30-95
    expect(result[0].age).toBe(30);
    expect(result[0].netWorth).toBeGreaterThan(50000);
    expect(result[65].age).toBe(95);
  });

  it("should apply withdrawals after retirement", () => {
    const result = computeProjection({
      currentAge: 64,
      retirementAge: 65,
      monthlyContribution: 2000,
      currentSavings: 100000,
      annualReturn: 0.04,
      inflationRate: 0.02,
    });

    expect(result).toHaveLength(32); // ages 64-95
    // At age 65, withdrawal starts
    expect(result[1].netWorth).toBeLessThan(result[0].netWorth);
  });

  it("should handle zero contributions", () => {
    const result = computeProjection({
      currentAge: 30,
      retirementAge: 65,
      monthlyContribution: 0,
      currentSavings: 100000,
      annualReturn: 0.07,
      inflationRate: 0.02,
    });

    expect(result).toHaveLength(66);
    // Growth only from returns
    expect(result[1].netWorth).toBeGreaterThan(100000);
  });
});

describe("computeMonthlyContribution", () => {
  it("should calculate positive surplus", () => {
    expect(computeMonthlyContribution(3000, 2000)).toBe(1000);
  });

  it("should return negative when expenses exceed income", () => {
    expect(computeMonthlyContribution(2000, 3000)).toBe(-1000);
  });

  it("should return zero when income equals expenses", () => {
    expect(computeMonthlyContribution(2500, 2500)).toBe(0);
  });
});

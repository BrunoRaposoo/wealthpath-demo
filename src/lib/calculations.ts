import type { ProjectionPoint, SimulationParams } from "@/types";

export function computeProjection(params: SimulationParams): ProjectionPoint[] {
  const {
    currentAge,
    retirementAge,
    monthlyContribution,
    currentSavings,
    annualReturn,
    inflationRate,
  } = params;

  const maxAge = 95;
  const points: ProjectionPoint[] = [];
  let netWorth = currentSavings;

  for (let age = currentAge; age <= maxAge; age++) {
    if (age < retirementAge) {
      netWorth += monthlyContribution * 12;
    } else {
      const yearsAfterRetirement = age - retirementAge;
      const inflationMultiplier = (1 + inflationRate) ** yearsAfterRetirement;
      const withdrawal = monthlyContribution * 12 * inflationMultiplier;
      netWorth -= withdrawal;
    }

    netWorth *= 1 + annualReturn;

    points.push({
      year: age - currentAge,
      age,
      netWorth: Math.round(netWorth * 100) / 100,
    });
  }

  return points;
}

export function computeMonthlyContribution(
  income: number,
  expenses: number,
): number {
  return income - expenses;
}

import type { PortfolioMap } from "@/types";

export const portfolios: PortfolioMap = {
  conservative: {
    spy: 20,
    agg: 80,
    expectedReturn: 0.042,
  },
  moderate: {
    spy: 60,
    agg: 40,
    expectedReturn: 0.068,
  },
  aggressive: {
    spy: 100,
    agg: 0,
    expectedReturn: 0.10,
  },
};

export const DEFAULT_INFLATION_RATE = 0.02;

export function getPortfolioForProfile(profile: keyof PortfolioMap) {
  return portfolios[profile] ?? portfolios.moderate;
}

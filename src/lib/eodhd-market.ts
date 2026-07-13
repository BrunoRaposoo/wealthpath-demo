import {
  DEFAULT_INFLATION_RATE,
  getPortfolioForProfile,
} from "@/config/portfolios";
import { getHistoricalData } from "@/lib/eodhd";
import type { RiskProfile } from "@/types";

interface MarketResult {
  expectedAnnualReturn: number;
  inflationRate: number;
  etfAllocation: { spy: number; agg: number };
  usedFallback: boolean;
}

async function calculateAnnualReturn(
  symbol: string,
  years: number = 5,
): Promise<number | null> {
  try {
    const to = new Date();
    const from = new Date();
    from.setFullYear(from.getFullYear() - years);

    const fromStr = from.toISOString().split("T")[0];
    const toStr = to.toISOString().split("T")[0];

    const data = await getHistoricalData(symbol, fromStr, toStr);

    if (data.length < 2) return null;

    const firstPrice = data[0].adjusted_close;
    const lastPrice = data[data.length - 1].adjusted_close;

    if (firstPrice <= 0) return null;

    const totalReturn = lastPrice / firstPrice;
    const annualReturn = totalReturn ** (1 / years) - 1;

    return annualReturn;
  } catch {
    return null;
  }
}

export async function getExpectedReturn(
  riskProfile: RiskProfile,
): Promise<MarketResult> {
  const portfolio = getPortfolioForProfile(riskProfile);

  const [spyReturn, aggReturn] = await Promise.all([
    calculateAnnualReturn("SPY"),
    calculateAnnualReturn("AGG"),
  ]);

  if (spyReturn !== null && aggReturn !== null) {
    const weightedReturn =
      (portfolio.spy / 100) * spyReturn + (portfolio.agg / 100) * aggReturn;

    return {
      expectedAnnualReturn: Math.round(weightedReturn * 10000) / 10000,
      inflationRate: DEFAULT_INFLATION_RATE,
      etfAllocation: { spy: portfolio.spy, agg: portfolio.agg },
      usedFallback: false,
    };
  }

  return {
    expectedAnnualReturn: portfolio.expectedReturn,
    inflationRate: DEFAULT_INFLATION_RATE,
    etfAllocation: { spy: portfolio.spy, agg: portfolio.agg },
    usedFallback: true,
  };
}

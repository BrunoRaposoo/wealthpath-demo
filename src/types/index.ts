export type RiskProfile = "conservative" | "moderate" | "aggressive";

export interface SetupInput {
  clientName: string;
  currentAge: number;
  retirementAge: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  riskProfile: RiskProfile;
}

export interface MarketData {
  expectedAnnualReturn: number;
  inflationRate: number;
  etfAllocation: { spy: number; agg: number };
}

export interface SimulationParams {
  currentAge: number;
  retirementAge: number;
  monthlyContribution: number;
  currentSavings: number;
  annualReturn: number;
  inflationRate: number;
}

export interface ProjectionPoint {
  year: number;
  age: number;
  netWorth: number;
}

export interface ScenarioSummary {
  label: string;
  retirementAge: number;
  monthlyContribution: number;
  finalNetWorth: number;
  yearsToRetirement: number;
}

export interface PortfolioConfig {
  spy: number;
  agg: number;
  expectedReturn: number;
}

export type PortfolioMap = Record<RiskProfile, PortfolioConfig>;

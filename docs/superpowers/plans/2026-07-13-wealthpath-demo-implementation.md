# WealthPath Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 2-page interactive financial planning demo with real market data and AI explanations.

**Architecture:** Next.js 16 App Router with Zustand for client state, TanStack Query for server state, Recharts for visualization, and server-side API routes for EODHD/OpenAI integration.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui, Recharts, Zustand, TanStack Query v5, Zod, react-hook-form, Biome, Vitest.

---

## Feature Overview

Each feature is independently testable and committable. Manual approval required between features.

| # | Feature | Description | Dependencies |
|---|---------|-------------|--------------|
| 1 | Domain Types | All TypeScript interfaces for the app | None |
| 2 | Calculation Logic | computeProjection + tests | Feature 1 |
| 3 | Portfolio Config | ETF mappings + fallback values | Feature 1 |
| 4 | Zustand Stores | useSetupStore + useSimulationStore | Feature 1 |
| 5 | EODHD Wrapper | Server-side market data fetching | Feature 3 |
| 6 | OpenAI Wrapper | Server-side AI explanations | Feature 1 |
| 7 | API Routes | POST /api/projections/setup + POST /api/ai/explain | Features 3, 5, 6 |
| 8 | Setup Form | Form component + page | Features 1, 4, 7 |
| 9 | Projection Components | Chart + Sliders + AI Explanation | Features 1, 2, 4 |
| 10 | Projection Page | Full page integration | Features 8, 9 |
| 11 | Polish | Loading states, error handling, final test | All previous |

---

## Feature 1: Domain Types

**Files:**
- Modify: `src/types/index.ts`

**Goal:** Define all TypeScript interfaces used throughout the app.

- [ ] **Step 1: Replace contents of `src/types/index.ts` with domain types**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add domain types for WealthPath demo"
```

---

## Feature 2: Calculation Logic

**Files:**
- Create: `src/lib/calculations.ts`
- Create: `src/lib/__tests__/calculations.test.ts`
- Modify: `package.json` (add vitest script)

**Goal:** Pure functions for financial projection with unit tests.

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
Expected: vitest added to devDependencies

- [ ] **Step 2: Add test script to `package.json`**

Add to scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `src/lib/calculations.ts`**

```typescript
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
```

- [ ] **Step 4: Create `src/lib/__tests__/calculations.test.ts`**

```typescript
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
```

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/lib/calculations.ts src/lib/__tests__/calculations.test.ts package.json package-lock.json
git commit -m "feat: add calculation logic with unit tests"
```

---

## Feature 3: Portfolio Config

**Files:**
- Create: `src/config/portfolios.ts`

**Goal:** ETF mappings for risk profiles with fallback values.

- [ ] **Step 1: Create `src/config/portfolios.ts`**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/config/portfolios.ts
git commit -m "feat: add portfolio config with ETF mappings and fallbacks"
```

---

## Feature 4: Zustand Stores

**Files:**
- Create: `src/stores/useSetupStore.ts`
- Create: `src/stores/useSimulationStore.ts`

**Goal:** Client-side state management for setup data and simulation parameters.

- [ ] **Step 1: Create `src/stores/useSetupStore.ts`**

```typescript
import { create } from "zustand";
import type { MarketData, SetupInput } from "@/types";

interface SetupStore {
  formData: SetupInput | null;
  marketData: MarketData | null;
  setFormData: (data: SetupInput) => void;
  setMarketData: (data: MarketData) => void;
  clearSetup: () => void;
}

export const useSetupStore = create<SetupStore>((set) => ({
  formData: null,
  marketData: null,
  setFormData: (data) => set({ formData: data }),
  setMarketData: (data) => set({ marketData: data }),
  clearSetup: () => set({ formData: null, marketData: null }),
}));
```

- [ ] **Step 2: Create `src/stores/useSimulationStore.ts`**

```typescript
import { create } from "zustand";
import type { SimulationParams } from "@/types";

interface SimulationStore {
  baseScenario: SimulationParams | null;
  currentParams: SimulationParams | null;
  isComparing: boolean;
  initParams: (params: SimulationParams) => void;
  setCurrentParams: (params: Partial<SimulationParams>) => void;
  fixBaseScenario: () => void;
  clearComparison: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  baseScenario: null,
  currentParams: null,
  isComparing: false,
  initParams: (params) => set({ currentParams: params }),
  setCurrentParams: (params) =>
    set((state) => ({
      currentParams: state.currentParams
        ? { ...state.currentParams, ...params }
        : null,
    })),
  fixBaseScenario: () => {
    const { currentParams } = get();
    if (currentParams) {
      set({ baseScenario: { ...currentParams }, isComparing: true });
    }
  },
  clearComparison: () => set({ baseScenario: null, isComparing: false }),
}));
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/stores/useSetupStore.ts src/stores/useSimulationStore.ts
git commit -m "feat: add Zustand stores for setup and simulation state"
```

---

## Feature 5: EODHD Wrapper

**Files:**
- Create: `src/lib/eodhd-market.ts`

**Goal:** Server-side wrapper to fetch expected returns from EODHD with fallback.

- [ ] **Step 1: Create `src/lib/eodhd-market.ts`**

```typescript
import { getPortfolioForProfile, DEFAULT_INFLATION_RATE } from "@/config/portfolios";
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/eodhd-market.ts
git commit -m "feat: add EODHD market data wrapper with fallback"
```

---

## Feature 6: OpenAI Wrapper

**Files:**
- Create: `src/lib/openai-explain.ts`

**Goal:** Server-side wrapper for AI explanations with timeout and fallback.

- [ ] **Step 1: Create `src/lib/openai-explain.ts`**

```typescript
import { createChatCompletion } from "@/lib/openai";
import type { ScenarioSummary } from "@/types";

export async function generateExplanation(
  scenarioA: ScenarioSummary,
  scenarioB: ScenarioSummary,
): Promise<string> {
  const prompt = `És um consultor financeiro. Explica de forma clara e curta (máx 3 frases) a diferença entre estes dois cenários de reforma.

Cenário A (${scenarioA.label}):
- Idade de reforma: ${scenarioA.retirementAge}
- Contribuição mensal: €${scenarioA.monthlyContribution}
- Património final: €${scenarioA.finalNetWorth}
- Anos até reforma: ${scenarioA.yearsToRetirement}

Cenário B (${scenarioB.label}):
- Idade de reforma: ${scenarioB.retirementAge}
- Contribuição mensal: €${scenarioB.monthlyContribution}
- Património final: €${scenarioB.finalNetWorth}
- Anos até reforma: ${scenarioB.yearsToRetirement}

Foca-te no impacto no património final e no risco de longevidade. Responde em português.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "És um consultor financeiro profissional." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    clearTimeout(timeout);

    return response.choices?.[0]?.message?.content ?? "";
  } catch {
    return "";
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/openai-explain.ts
git commit -m "feat: add OpenAI explanation wrapper with timeout"
```

---

## Feature 7: API Routes

**Files:**
- Create: `src/app/api/projections/setup/route.ts`
- Create: `src/app/api/ai/explain/route.ts`
- Create: `src/lib/validation.ts`

**Goal:** Server-side API routes with Zod validation.

- [ ] **Step 1: Create `src/lib/validation.ts`**

```typescript
import { z } from "zod";

export const setupSchema = z
  .object({
    clientName: z.string().min(1, "Nome é obrigatório"),
    currentAge: z.number().int().min(18, "Idade mínima: 18").max(80, "Idade máxima: 80"),
    retirementAge: z.number().int().min(19, "Idade de reforma mínima: 19").max(80),
    monthlyIncome: z.number().min(0, "Rendimento não pode ser negativo"),
    monthlyExpenses: z.number().min(0, "Despesas não podem ser negativas"),
    currentSavings: z.number().min(0, "Poupanças não podem ser negativas"),
    riskProfile: z.enum(["conservative", "moderate", "aggressive"]),
  })
  .refine((data) => data.retirementAge > data.currentAge, {
    message: "Idade de reforma deve ser superior à idade atual",
    path: ["retirementAge"],
  });

export const explainSchema = z.object({
  scenarioA: z.object({
    label: z.string(),
    retirementAge: z.number(),
    monthlyContribution: z.number(),
    finalNetWorth: z.number(),
    yearsToRetirement: z.number(),
  }),
  scenarioB: z.object({
    label: z.string(),
    retirementAge: z.number(),
    monthlyContribution: z.number(),
    finalNetWorth: z.number(),
    yearsToRetirement: z.number(),
  }),
});
```

- [ ] **Step 2: Create `src/app/api/projections/setup/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { setupSchema } from "@/lib/validation";
import { getExpectedReturn } from "@/lib/eodhd-market";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = setupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { riskProfile } = parsed.data;
    const marketData = await getExpectedReturn(riskProfile);

    return NextResponse.json(marketData);
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Create `src/app/api/ai/explain/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { explainSchema } from "@/lib/validation";
import { generateExplanation } from "@/lib/openai-explain";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = explainSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { scenarioA, scenarioB } = parsed.data;
    const explanation = await generateExplanation(scenarioA, scenarioB);

    return NextResponse.json({ explanation });
  } catch {
    return NextResponse.json({ explanation: "" });
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation.ts src/app/api/projections/setup/route.ts src/app/api/ai/explain/route.ts
git commit -m "feat: add API routes with Zod validation"
```

---

## Feature 8: Setup Form

**Files:**
- Create: `src/components/SetupForm.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx` (add header)

**Goal:** Setup form with validation and redirect to projection page.

- [ ] **Step 1: Install react-hook-form**

Run: `npm install react-hook-form @hookform/resolvers`
Expected: react-hook-form added to dependencies

- [ ] **Step 2: Create `src/components/SetupForm.tsx`**

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { setupSchema } from "@/lib/validation";
import { useSetupStore } from "@/stores/useSetupStore";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { computeMonthlyContribution } from "@/lib/calculations";
import type { SetupInput, RiskProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const riskProfiles: { value: RiskProfile; label: string }[] = [
  { value: "conservative", label: "Conservative (20% SPY / 80% AGG)" },
  { value: "moderate", label: "Moderate (60% SPY / 40% AGG)" },
  { value: "aggressive", label: "Aggressive (100% SPY)" },
];

export function SetupForm() {
  const router = useRouter();
  const setFormData = useSetupStore((s) => s.setFormData);
  const setMarketData = useSetupStore((s) => s.setMarketData);
  const initParams = useSimulationStore((s) => s.initParams);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetupInput>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      riskProfile: "moderate",
    },
  });

  const monthlyIncome = watch("monthlyIncome") ?? 0;
  const monthlyExpenses = watch("monthlyExpenses") ?? 0;
  const surplus = computeMonthlyContribution(monthlyIncome, monthlyExpenses);

  const mutation = useMutation({
    mutationFn: async (data: SetupInput) => {
      const res = await fetch("/api/projections/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to fetch market data");
      return res.json();
    },
    onSuccess: (marketData, variables) => {
      setFormData(variables);
      setMarketData(marketData);

      initParams({
        currentAge: variables.currentAge,
        retirementAge: variables.retirementAge,
        monthlyContribution: surplus,
        currentSavings: variables.currentSavings,
        annualReturn: marketData.expectedAnnualReturn,
        inflationRate: marketData.inflationRate,
      });

      router.push("/projection");
    },
  });

  const onSubmit = (data: SetupInput) => {
    if (surplus <= 0) return;
    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>WealthPath Setup</CardTitle>
        <CardDescription>
          Configure os dados do cliente para gerar a projeção financeira.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="clientName" className="text-sm font-medium">
              Nome do Cliente
            </label>
            <Input id="clientName" {...register("clientName")} />
            {errors.clientName && (
              <p className="text-sm text-destructive">{errors.clientName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="currentAge" className="text-sm font-medium">
                Idade Atual
              </label>
              <Input
                id="currentAge"
                type="number"
                {...register("currentAge", { valueAsNumber: true })}
              />
              {errors.currentAge && (
                <p className="text-sm text-destructive">{errors.currentAge.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="retirementAge" className="text-sm font-medium">
                Idade de Reforma
              </label>
              <Input
                id="retirementAge"
                type="number"
                {...register("retirementAge", { valueAsNumber: true })}
              />
              {errors.retirementAge && (
                <p className="text-sm text-destructive">
                  {errors.retirementAge.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="monthlyIncome" className="text-sm font-medium">
                Rendimento Mensal (€)
              </label>
              <Input
                id="monthlyIncome"
                type="number"
                step="0.01"
                {...register("monthlyIncome", { valueAsNumber: true })}
              />
              {errors.monthlyIncome && (
                <p className="text-sm text-destructive">
                  {errors.monthlyIncome.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="monthlyExpenses" className="text-sm font-medium">
                Despesas Mensais (€)
              </label>
              <Input
                id="monthlyExpenses"
                type="number"
                step="0.01"
                {...register("monthlyExpenses", { valueAsNumber: true })}
              />
              {errors.monthlyExpenses && (
                <p className="text-sm text-destructive">
                  {errors.monthlyExpenses.message}
                </p>
              )}
            </div>
          </div>

          {surplus <= 0 && monthlyIncome > 0 && monthlyExpenses > 0 && (
            <p className="text-sm text-destructive">
              As despesas excedem o rendimento. Ajuste os valores para continuar.
            </p>
          )}

          <div className="space-y-2">
            <label htmlFor="currentSavings" className="text-sm font-medium">
              Valor Atual Investido (€)
            </label>
            <Input
              id="currentSavings"
              type="number"
              step="0.01"
              {...register("currentSavings", { valueAsNumber: true })}
            />
            {errors.currentSavings && (
              <p className="text-sm text-destructive">
                {errors.currentSavings.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="riskProfile" className="text-sm font-medium">
              Perfil de Risco
            </label>
            <select
              id="riskProfile"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register("riskProfile")}
            >
              {riskProfiles.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending || surplus <= 0}
          >
            {mutation.isPending ? "A obter dados de mercado..." : "Gerar Projeção"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Update `src/app/page.tsx`**

```typescript
import { SetupForm } from "@/components/SetupForm";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <SetupForm />
    </main>
  );
}
```

- [ ] **Step 4: Update `src/app/layout.tsx` to add header**

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WealthPath",
  description: "Financial planning SaaS demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground">WealthPath</h1>
          </div>
        </header>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Run linter**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/components/SetupForm.tsx src/app/page.tsx src/app/layout.tsx package.json package-lock.json
git commit -m "feat: add setup form with validation and API integration"
```

---

## Feature 9: Projection Components

**Files:**
- Create: `src/components/ProjectionChart.tsx`
- Create: `src/components/ScenarioSliders.tsx`
- Create: `src/components/AIExplanation.tsx`

**Goal:** Reusable components for the projection page.

- [ ] **Step 1: Create `src/components/ProjectionChart.tsx`**

```typescript
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ProjectionPoint } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProjectionChartProps {
  data: ProjectionPoint[];
  comparisonData?: ProjectionPoint[];
  isAnimating?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProjectionChart({
  data,
  comparisonData,
  isAnimating = true,
}: ProjectionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Património Líquido</CardTitle>
        <CardDescription>
          Projeção desde a idade atual até aos 95 anos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="age"
                label={{ value: "Idade", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                label={{
                  value: "Património (€)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Património"]}
                labelFormatter={(label) => `Idade: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={isAnimating}
                name="Cenário Atual"
              />
              {comparisonData && (
                <Line
                  type="monotone"
                  data={comparisonData}
                  dataKey="netWorth"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={isAnimating}
                  name="Cenário Base"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create `src/components/ScenarioSliders.tsx`**

```typescript
"use client";

import { useSimulationStore } from "@/stores/useSimulationStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ScenarioSliders() {
  const currentParams = useSimulationStore((s) => s.currentParams);
  const setCurrentParams = useSimulationStore((s) => s.setCurrentParams);
  const baseScenario = useSimulationStore((s) => s.baseScenario);
  const isComparing = useSimulationStore((s) => s.isComparing);
  const fixBaseScenario = useSimulationStore((s) => s.fixBaseScenario);
  const clearComparison = useSimulationStore((s) => s.clearComparison);

  if (!currentParams) return null;

  const maxRetirementAge = 75;
  const maxContribution = currentParams.monthlyContribution * 2 || 2000;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulação</CardTitle>
        <CardDescription>
          Ajuste os parâmetros para ver o impacto na projeção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="retirement-slider" className="text-sm font-medium">
              Idade de Reforma
            </label>
            <span className="text-sm text-muted-foreground">
              {currentParams.retirementAge} anos
            </span>
          </div>
          <input
            id="retirement-slider"
            type="range"
            min={currentParams.currentAge + 1}
            max={maxRetirementAge}
            value={currentParams.retirementAge}
            onChange={(e) =>
              setCurrentParams({ retirementAge: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="contribution-slider" className="text-sm font-medium">
              Contribuição Mensal
            </label>
            <span className="text-sm text-muted-foreground">
              €{currentParams.monthlyContribution}
            </span>
          </div>
          <input
            id="contribution-slider"
            type="range"
            min={0}
            max={maxContribution}
            step={50}
            value={currentParams.monthlyContribution}
            onChange={(e) =>
              setCurrentParams({ monthlyContribution: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          {!isComparing ? (
            <Button variant="outline" onClick={fixBaseScenario}>
              Fixar cenário base
            </Button>
          ) : (
            <Button variant="outline" onClick={clearComparison}>
              Remover comparação
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create `src/components/AIExplanation.tsx`**

```typescript
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AIExplanation() {
  const baseScenario = useSimulationStore((s) => s.baseScenario);
  const currentParams = useSimulationStore((s) => s.currentParams);
  const isComparing = useSimulationStore((s) => s.isComparing);
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["ai-explanation", baseScenario, currentParams],
    queryFn: async () => {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioA: {
            label: "Base",
            retirementAge: baseScenario?.retirementAge ?? 0,
            monthlyContribution: baseScenario?.monthlyContribution ?? 0,
            finalNetWorth: 0,
            yearsToRetirement: baseScenario
              ? baseScenario.retirementAge - baseScenario.currentAge
              : 0,
          },
          scenarioB: {
            label: "Atual",
            retirementAge: currentParams?.retirementAge ?? 0,
            monthlyContribution: currentParams?.monthlyContribution ?? 0,
            finalNetWorth: 0,
            yearsToRetirement: currentParams
              ? currentParams.retirementAge - currentParams.currentAge
              : 0,
          },
        }),
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled,
  });

  if (!isComparing) return null;

  const loading = isLoading || isFetching;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Explicação por IA</CardTitle>
        <CardDescription>
          Análise da diferença entre os dois cenários
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!enabled && (
          <Button onClick={() => setEnabled(true)} disabled={loading}>
            Explicar diferença
          </Button>
        )}
        {enabled && loading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        )}
        {enabled && !loading && data?.explanation && (
          <p className="text-sm text-muted-foreground">{data.explanation}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Run linter**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/ProjectionChart.tsx src/components/ScenarioSliders.tsx src/components/AIExplanation.tsx
git commit -m "feat: add projection components (chart, sliders, AI explanation)"
```

---

## Feature 10: Projection Page

**Files:**
- Create: `src/app/projection/page.tsx`

**Goal:** Full projection page integrating all components.

- [ ] **Step 1: Create `src/app/projection/page.tsx`**

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSetupStore } from "@/stores/useSetupStore";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { computeProjection } from "@/lib/calculations";
import { ProjectionChart } from "@/components/ProjectionChart";
import { ScenarioSliders } from "@/components/ScenarioSliders";
import { AIExplanation } from "@/components/AIExplanation";

export default function ProjectionPage() {
  const router = useRouter();
  const formData = useSetupStore((s) => s.formData);
  const marketData = useSetupStore((s) => s.marketData);
  const currentParams = useSimulationStore((s) => s.currentParams);
  const baseScenario = useSimulationStore((s) => s.baseScenario);
  const isComparing = useSimulationStore((s) => s.isComparing);

  useEffect(() => {
    if (!formData || !marketData || !currentParams) {
      router.push("/");
    }
  }, [formData, marketData, currentParams, router]);

  if (!formData || !marketData || !currentParams) {
    return null;
  }

  const currentProjection = computeProjection(currentParams);
  const baseProjection = baseScenario ? computeProjection(baseScenario) : undefined;

  return (
    <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Projeção para {formData.clientName}
        </h2>
        <p className="text-sm text-muted-foreground">
          Perfil: {formData.riskProfile} | Retorno esperado:{" "}
          {(marketData.expectedAnnualReturn * 100).toFixed(1)}%
        </p>
      </div>

      <ProjectionChart
        data={currentProjection}
        comparisonData={isComparing ? baseProjection : undefined}
        isAnimating={!isComparing}
      />

      <ScenarioSliders />

      <AIExplanation />
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run linter**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/projection/page.tsx
git commit -m "feat: add projection page with full integration"
```

---

## Feature 11: Polish

**Files:**
- Modify: Various (loading states, error handling)
- Modify: `README.md`

**Goal:** Final polish, loading states, error handling, documentation.

- [ ] **Step 1: Add loading skeleton to projection page**

Update `src/app/projection/page.tsx` to show skeleton while checking store:

```typescript
// Add after the useEffect, before the early return
if (!formData || !marketData || !currentParams) {
  return (
    <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
      <div className="space-y-6">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Add toast for EODHD fallback**

In `src/components/SetupForm.tsx`, update the mutation onSuccess to check `usedFallback`:

```typescript
onSuccess: (marketData, variables) => {
  setFormData(variables);
  setMarketData(marketData);

  initParams({
    currentAge: variables.currentAge,
    retirementAge: variables.retirementAge,
    monthlyContribution: surplus,
    currentSavings: variables.currentSavings,
    annualReturn: marketData.expectedAnnualReturn,
    inflationRate: marketData.inflationRate,
  });

  if (marketData.usedFallback) {
    console.warn("EODHD API unavailable, using fallback values");
  }

  router.push("/projection");
},
```

- [ ] **Step 3: Update README with setup instructions**

Update `README.md` to reflect the actual project structure and add environment variable instructions.

- [ ] **Step 4: Run full lint**

Run: `npm run check`
Expected: No errors

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add loading states, error handling, and update docs"
```

---

## Final Verification

- [ ] **Step 1: Build the project**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 3: Run linter**

Run: `npm run check`
Expected: No errors

- [ ] **Step 4: Manual flow test**

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Fill in setup form with test data
4. Verify redirect to /projection
5. Verify chart renders
6. Move sliders, verify chart updates
7. Click "Fixar cenário base"
8. Move sliders again, verify comparison line
9. Click "Explicar diferença", verify AI response

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final verification and cleanup"
```

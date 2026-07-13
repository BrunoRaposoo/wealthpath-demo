# WealthPath Demo Design Spec

> **Date:** 2026-07-13
> **Status:** Approved
> **Scope:** 2-page interactive financial planning demo

---

## 1. Overview

**Goal:** Build a self-service demo that demonstrates interactive financial planning with real market data (EODHD) and AI explanations (OpenAI). Target audience: investors, stakeholders, early adopter consultants.

**Pages:**
1. `/` — Setup form (clientName, currentAge, retirementAge, monthlyIncome, monthlyExpenses, currentSavings, riskProfile)
2. `/projection` — Interactive projection with chart, sliders, comparison, AI explanation

**Key constraints:**
- No authentication, no persistence, no multi-tenant
- Self-service: must work independently with polished error states
- Currency: EUR (€)
- Requires API keys (EODHD, OpenAI) — no fully offline mode

---

## 2. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) + TypeScript strict | Actual version in project |
| React | 19.x | Actual version in project |
| Styling | Tailwind CSS v4 + shadcn/ui | Already installed |
| Charts | Recharts | Already installed |
| Sliders | Radix Slider (via shadcn/ui) | Accessible, performatic |
| Validation | Zod + react-hook-form | To be installed |
| Server state | TanStack Query v5 | Already installed |
| Client state | Zustand | Already installed, add 2 stores |
| Linting | Biome | Already configured |
| Tests | Vitest + React Testing Library | Core logic only |
| Market data | EODHD API (server-side) | Real API + fallback |
| AI | OpenAI gpt-4o-mini (server-side) | Optional, 5s timeout |

---

## 3. Data Model

### Types (`src/types/index.ts`)

```typescript
type RiskProfile = "conservative" | "moderate" | "aggressive";

interface SetupInput {
  clientName: string;
  currentAge: number;
  retirementAge: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  riskProfile: RiskProfile;
}

interface MarketData {
  expectedAnnualReturn: number;
  inflationRate: number;
  etfAllocation: { spy: number; agg: number };
}

interface SimulationParams {
  currentAge: number;
  retirementAge: number;
  monthlyContribution: number;
  currentSavings: number;
  annualReturn: number;
  inflationRate: number;
}

interface ProjectionPoint {
  year: number;
  age: number;
  netWorth: number;
}

interface ScenarioSummary {
  label: string;
  retirementAge: number;
  monthlyContribution: number;
  finalNetWorth: number;
  yearsToRetirement: number;
}
```

---

## 4. Calculation Logic

### `computeProjection(params: SimulationParams): ProjectionPoint[]`

Annual compounding model, no taxes, no account types. Simplification: contributions made during the year earn a full year's return (end-of-year approximation).

```
For each year from currentAge to 95:
  if age < retirementAge:
    netWorth += monthlyContribution * 12
    netWorth *= (1 + annualReturn)
  else:
    withdrawal = monthlyExpenses * 12 * (1 + inflationRate)^(age - retirementAge)
    netWorth -= withdrawal
    netWorth *= (1 + annualReturn)
  Push { year, age, netWorth }
Return results
```

### `computeMonthlyContribution(income, expenses): number`

Returns `income - expenses`. If negative, setup form warns and blocks.

---

## 5. API Routes

### `POST /api/projections/setup`

- Validates input with Zod
- Fetches EODHD data for risk profile's ETFs
- Returns `{ expectedAnnualReturn, inflationRate, etfAllocation }`
- On EODHD failure: returns fallback values + `usedFallback: true`

### `POST /api/ai/explain`

- Receives `{ scenarioA: ScenarioSummary, scenarioB: ScenarioSummary }`
- Calls OpenAI gpt-4o-mini (temperature: 0.3, max_tokens: 150)
- Returns `{ explanation: string }`
- On failure/timeout (5s): returns `{ explanation: "" }`

---

## 6. State Management

### `useSetupStore` (Zustand)

- `formData: SetupInput | null`
- `marketData: MarketData | null`
- Actions: `setFormData`, `setMarketData`, `clearSetup`

### `useSimulationStore` (Zustand)

- `baseScenario: SimulationParams | null`
- `currentParams: SimulationParams`
- `isComparing: boolean`
- Actions: `setCurrentParams`, `fixBaseScenario`, `clearComparison`

### Data Flow

1. Setup form → `useSetupStore.setFormData()`
2. API → `useSetupStore.setMarketData()`
3. Redirect to `/projection`
4. Projection page initializes `useSimulationStore` from setup store
5. Sliders update `currentParams`
6. Chart computes projection from `currentParams`
7. "Fixar cenário base" copies to `baseScenario`
8. AI explanation reads both scenarios

---

## 7. Components

### SetupForm (`src/components/SetupForm.tsx`)

- react-hook-form + Zod validation
- Fields: clientName, currentAge, retirementAge, monthlyIncome, monthlyExpenses, currentSavings, riskProfile
- Risk profile dropdown shows ETF allocation (e.g., "Moderate (60% SPY / 40% AGG)")
- Submit button with loading state
- Warning if income < expenses
- On success: store data, redirect to `/projection`

### ProjectionChart (`src/components/ProjectionChart.tsx`)

- Recharts LineChart
- X-axis: age (currentAge to 95)
- Y-axis: net worth (€)
- Single line for current scenario
- Second line (dashed) when comparing
- Animation disabled during slider interaction

### ScenarioSliders (`src/components/ScenarioSliders.tsx`)

- "Idade de Reforma" slider (currentAge+1 to 75)
- "Contribuição Mensal" slider (0 to 2× current contribution)
- Live update on every change (no debounce)

### AIExplanation (`src/components/AIExplanation.tsx`)

- Only appears when comparing scenarios
- "Explicar diferencia" button triggers API call
- Skeleton while loading
- Silent failure (no error shown)

---

## 8. Pages

### `/` (Setup)

- Full-width SetupForm centered on page
- Header with "WealthPath" branding

### `/projection` (Interactive Projection)

- Header (same as setup)
- ProjectionChart (full width)
- ScenarioSliders (below chart)
- Comparison controls (below sliders)
- AIExplanation (below comparison)

### Redirect Logic

- If no setup data in Zustand → redirect to `/`
- After setup submit → redirect to `/projection`

---

## 9. Error Handling

| Scenario | Behavior |
|----------|----------|
| Validation error | Inline under field |
| EODHD failure | Toast notification + fallback data, proceed |
| Network error | Retry button, disable form |
| No setup data on /projection | Silent redirect to / |
| AI failure | Button stays clickable, no error shown |
| AI timeout (5s) | Hide explanation block |
| Negative surplus | Warning, block submission |

---

## 10. Implementation Plan

### Phase 1: Foundation
- Update types/index.ts
- Install Zod + react-hook-form
- Create lib/validation.ts
- Create config/portfolios.ts

### Phase 2: State and Logic
- Create stores/useSetupStore.ts
- Create stores/useSimulationStore.ts
- Create lib/calculations.ts
- Unit tests for calculations

### Phase 3: API Routes
- POST /api/projections/setup
- POST /api/ai/explain

### Phase 4: Setup Page
- components/SetupForm.tsx
- Update app/page.tsx
- Redirect logic

### Phase 5: Projection Page
- components/ProjectionChart.tsx
- components/ScenarioSliders.tsx
- components/AIExplanation.tsx
- app/projection/page.tsx

### Phase 6: Polish
- Loading skeletons
- Error boundaries
- Manual flow test
- Biome lint/format

---

## 11. Definition of Done

- [ ] Biome lint passes with no errors
- [ ] TypeScript strict mode, no `any`
- [ ] Unit tests pass for calculations and schemas
- [ ] Full flow works: setup → redirect → base projection → slider → comparison → AI explanation
- [ ] Error states verified: no internet shows fallback, AI failure doesn't break page
- [ ] README updated with setup instructions

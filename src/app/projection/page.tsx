"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AIExplanation } from "@/components/AIExplanation";
import { ProjectionChart } from "@/components/ProjectionChart";
import { ScenarioSliders } from "@/components/ScenarioSliders";
import { Skeleton } from "@/components/ui/skeleton";
import { computeProjection } from "@/lib/calculations";
import { useSetupStore } from "@/stores/useSetupStore";
import { useSimulationStore } from "@/stores/useSimulationStore";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

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

  const currentProjection = computeProjection(currentParams);
  const baseProjection = baseScenario
    ? computeProjection(baseScenario)
    : undefined;

  const retirementPoint = currentProjection.find(
    (p) => p.age === currentParams.retirementAge,
  );
  const finalNetWorth = retirementPoint
    ? retirementPoint.netWorth
    : (currentProjection.at(-1)?.netWorth ?? 0);

  const baseRetirementNetWorth = baseProjection
    ? (() => {
        const bp = baseProjection.find(
          (p) => p.age === (baseScenario?.retirementAge ?? 0),
        );
        return bp ? bp.netWorth : (baseProjection.at(-1)?.netWorth ?? 0);
      })()
    : 0;

  const deltaPct =
    baseRetirementNetWorth > 0
      ? ((finalNetWorth - baseRetirementNetWorth) / baseRetirementNetWorth) *
        100
      : 0;

  return (
    <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-5">
        <div>
          <span className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold text-[13px] px-3 py-1.5 rounded-full">
            ● Perfil {formData.riskProfile} · retorno{" "}
            {(marketData.expectedAnnualReturn * 100).toFixed(1)}%/ano
          </span>
          <h1 className="text-[28px] font-extrabold tracking-[-0.02em] mt-3">
            Projeção para {formData.clientName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Simulação de reforma até aos 95 anos, ajustada à inflação.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-[0_1px_3px_rgba(11,43,38,.06),0_12px_32px_-12px_rgba(11,43,38,.12)]">
          <div className="text-[13px] font-semibold text-muted-foreground">
            Património à reforma
          </div>
          <div className="text-2xl font-extrabold tracking-[-0.02em] mt-1.5">
            {formatCurrency(finalNetWorth)}
          </div>
          {isComparing && deltaPct !== 0 && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold mt-1.5 px-2 py-0.5 rounded-full ${
                deltaPct > 0
                  ? "text-[#0b7d5e] bg-[#e3f4ee]"
                  : "text-[#c2410c] bg-[#fdece1]"
              }`}
            >
              {deltaPct > 0 ? "▲" : "▼"} {deltaPct > 0 ? "+" : ""}
              {deltaPct.toFixed(1)}% vs base
            </span>
          )}
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-[0_1px_3px_rgba(11,43,38,.06),0_12px_32px_-12px_rgba(11,43,38,.12)]">
          <div className="text-[13px] font-semibold text-muted-foreground">
            Idade de reforma
          </div>
          <div className="text-2xl font-extrabold tracking-[-0.02em] mt-1.5">
            {currentParams.retirementAge} anos
          </div>
          {isComparing && baseScenario && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold mt-1.5 px-2 py-0.5 rounded-full ${
                currentParams.retirementAge < baseScenario.retirementAge
                  ? "text-[#0b7d5e] bg-[#e3f4ee]"
                  : "text-[#c2410c] bg-[#fdece1]"
              }`}
            >
              {currentParams.retirementAge < baseScenario.retirementAge
                ? "▼"
                : "▲"}{" "}
              {Math.abs(
                currentParams.retirementAge - baseScenario.retirementAge,
              )}{" "}
              anos{" "}
              {currentParams.retirementAge < baseScenario.retirementAge
                ? "mais cedo"
                : "mais tarde"}
            </span>
          )}
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-[0_1px_3px_rgba(11,43,38,.06),0_12px_32px_-12px_rgba(11,43,38,.12)]">
          <div className="text-[13px] font-semibold text-muted-foreground">
            Contribuição mensal
          </div>
          <div className="text-2xl font-extrabold tracking-[-0.02em] mt-1.5">
            {formatCurrency(currentParams.monthlyContribution)}
          </div>
          {isComparing && baseScenario && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold mt-1.5 px-2 py-0.5 rounded-full ${
                currentParams.monthlyContribution >
                baseScenario.monthlyContribution
                  ? "text-[#0b7d5e] bg-[#e3f4ee]"
                  : "text-[#c2410c] bg-[#fdece1]"
              }`}
            >
              {currentParams.monthlyContribution >
              baseScenario.monthlyContribution
                ? "▲"
                : "▼"}{" "}
              +€
              {Math.abs(
                currentParams.monthlyContribution -
                  baseScenario.monthlyContribution,
              )}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <ProjectionChart
          data={currentProjection}
          comparisonData={isComparing ? baseProjection : undefined}
          isAnimating={!isComparing}
        />

        <div className="flex flex-col gap-5">
          <ScenarioSliders />
          <AIExplanation />
        </div>
      </div>
    </main>
  );
}

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

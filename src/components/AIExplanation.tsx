"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { computeProjection } from "@/lib/calculations";
import { useSimulationStore } from "@/stores/useSimulationStore";
import type { SimulationParams } from "@/types";

function getFinalNetWorth(params: SimulationParams | null): number {
  if (!params) return 0;
  const points = computeProjection(params);
  const retirementPoint = points.find((p) => p.age === params.retirementAge);
  return retirementPoint
    ? retirementPoint.netWorth
    : (points.at(-1)?.netWorth ?? 0);
}

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
            finalNetWorth: getFinalNetWorth(baseScenario),
            yearsToRetirement: baseScenario
              ? baseScenario.retirementAge - baseScenario.currentAge
              : 0,
          },
          scenarioB: {
            label: "Atual",
            retirementAge: currentParams?.retirementAge ?? 0,
            monthlyContribution: currentParams?.monthlyContribution ?? 0,
            finalNetWorth: getFinalNetWorth(currentParams),
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
    <div className="rounded-2xl bg-[linear-gradient(160deg,#0b7d5e,#0f9d76)] text-white p-5 shadow-[0_1px_3px_rgba(11,43,38,.06),0_12px_32px_-12px_rgba(11,43,38,.12)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-white">✨ Explicação por IA</h3>
        <span className="bg-white/18 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          gpt-oss
        </span>
      </div>
      <div>
        {!enabled && (
          <Button
            onClick={() => setEnabled(true)}
            disabled={loading}
            className="bg-white text-[#0b7d5e] font-bold rounded-xl hover:bg-white/90 transition-colors"
          >
            Explicar diferença
          </Button>
        )}
        {enabled && loading && (
          <div className="space-y-2">
            <Skeleton className="h-3 w-full bg-white/25 rounded-md" />
            <Skeleton className="h-3 w-[80%] bg-white/25 rounded-md" />
            <Skeleton className="h-3 w-[60%] bg-white/25 rounded-md" />
          </div>
        )}
        {enabled && !loading && data?.explanation && (
          <p className="text-[14.5px] leading-relaxed text-white/92">
            {data.explanation}
          </p>
        )}
      </div>
    </div>
  );
}

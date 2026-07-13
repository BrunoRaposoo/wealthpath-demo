"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimulationStore } from "@/stores/useSimulationStore";

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

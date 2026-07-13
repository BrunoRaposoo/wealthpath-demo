"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSimulationStore } from "@/stores/useSimulationStore";

export function ScenarioSliders() {
  const currentParams = useSimulationStore((s) => s.currentParams);
  const setCurrentParams = useSimulationStore((s) => s.setCurrentParams);
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
            <label
              htmlFor="contribution-slider"
              className="text-sm font-medium"
            >
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

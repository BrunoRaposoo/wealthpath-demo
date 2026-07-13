"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const retirementPct =
    ((currentParams.retirementAge - (currentParams.currentAge + 1)) /
      (maxRetirementAge - (currentParams.currentAge + 1))) *
    100;
  const contributionPct =
    (currentParams.monthlyContribution / maxContribution) * 100;

  return (
    <Card className="border-border bg-card shadow-[0_1px_3px_rgba(11,43,38,.06),0_12px_32px_-12px_rgba(11,43,38,.12)]">
      <CardHeader>
        <CardTitle className="text-base font-bold">Ajustar cenário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2.5">
          <div className="flex justify-between font-semibold text-sm">
            <label htmlFor="retirement-slider">Idade de Reforma</label>
            <span className="text-primary">{currentParams.retirementAge}</span>
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
            style={
              { "--slider-pct": `${retirementPct}%` } as React.CSSProperties
            }
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between font-semibold text-sm">
            <label htmlFor="contribution-slider">Contribuição Mensal</label>
            <span className="text-primary">
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
            style={
              { "--slider-pct": `${contributionPct}%` } as React.CSSProperties
            }
          />
        </div>

        <div className="flex gap-2">
          {!isComparing ? (
            <Button
              variant="outline"
              onClick={fixBaseScenario}
              className="border-border font-bold rounded-xl"
            >
              Fixar cenário base
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={clearComparison}
              className="border-border font-bold rounded-xl"
            >
              Remover comparação
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

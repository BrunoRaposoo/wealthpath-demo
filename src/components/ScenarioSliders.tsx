"use client";

import { useTranslations } from "next-intl";
import { ScenarioField } from "@/components/ScenarioField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSimulationStore } from "@/stores/useSimulationStore";

export function ScenarioSliders() {
  const t = useTranslations("Scenario");
  const currentParams = useSimulationStore((s) => s.currentParams);
  const setCurrentParams = useSimulationStore((s) => s.setCurrentParams);
  const isComparing = useSimulationStore((s) => s.isComparing);
  const fixBaseScenario = useSimulationStore((s) => s.fixBaseScenario);
  const clearComparison = useSimulationStore((s) => s.clearComparison);

  if (!currentParams) return null;

  const maxRetirementAge = 75;
  // Teto dinâmico: ao escrever um valor acima do dobro, o slider expande (não faz clamp duro).
  const maxContribution = Math.max(2000, currentParams.monthlyContribution * 2);

  return (
    <Card className="border-border bg-card shadow-[0_1px_3px_rgba(11,43,38,.06),0_12px_32px_-12px_rgba(11,43,38,.12)]">
      <CardHeader>
        <CardTitle className="text-base font-bold">{t("adjust")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScenarioField
          id="retirement-slider"
          label={t("retirementLabel")}
          value={currentParams.retirementAge}
          min={currentParams.currentAge + 1}
          max={maxRetirementAge}
          onChange={(v) => setCurrentParams({ retirementAge: v })}
        />

        <ScenarioField
          id="contribution-slider"
          label={t("contributionLabel")}
          value={currentParams.monthlyContribution}
          min={0}
          max={maxContribution}
          step={50}
          prefix="€"
          onChange={(v) => setCurrentParams({ monthlyContribution: v })}
        />

        <div className="flex gap-2">
          {!isComparing ? (
            <Button
              variant="outline"
              onClick={fixBaseScenario}
              className="border-border font-bold rounded-xl"
            >
              {t("fixBase")}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={clearComparison}
              className="border-border font-bold rounded-xl"
            >
              {t("removeComparison")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { computeMonthlyContribution } from "@/lib/calculations";
import { setupSchema } from "@/lib/validation";
import { useSetupStore } from "@/stores/useSetupStore";
import { useSimulationStore } from "@/stores/useSimulationStore";
import type { RiskProfile, SetupInput } from "@/types";

export function SetupForm() {
  const t = useTranslations("Setup");
  const router = useRouter();
  const setFormData = useSetupStore((s) => s.setFormData);
  const setMarketData = useSetupStore((s) => s.setMarketData);
  const initParams = useSimulationStore((s) => s.initParams);

  const riskProfiles: { value: RiskProfile; label: string }[] = [
    { value: "conservative", label: t("riskConservative") },
    { value: "moderate", label: t("riskModerate") },
    { value: "aggressive", label: t("riskAggressive") },
  ];

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
      if (!res.ok) throw new Error(t("fetchError"));
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
    <Card className="w-full max-w-2xl mx-auto border-border bg-card shadow-[0_1px_3px_rgba(11,43,38,.06),0_12px_32px_-12px_rgba(11,43,38,.12)]">
      <CardHeader>
        <CardTitle className="text-base font-bold">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="clientName" className="text-sm font-medium">
              {t("clientName")}
            </label>
            <Input id="clientName" {...register("clientName")} />
            {errors.clientName && (
              <p className="text-sm text-destructive">
                {errors.clientName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="currentAge" className="text-sm font-medium">
                {t("currentAge")}
              </label>
              <Input
                id="currentAge"
                type="number"
                {...register("currentAge", { valueAsNumber: true })}
              />
              {errors.currentAge && (
                <p className="text-sm text-destructive">
                  {errors.currentAge.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="retirementAge" className="text-sm font-medium">
                {t("retirementAge")}
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
                {t("monthlyIncome")}
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
                {t("monthlyExpenses")}
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
            <p className="text-sm text-destructive">{t("surplusError")}</p>
          )}

          <div className="space-y-2">
            <label htmlFor="currentSavings" className="text-sm font-medium">
              {t("currentSavings")}
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
              {t("riskProfile")}
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
            className="w-full bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
            disabled={mutation.isPending || surplus <= 0}
          >
            {mutation.isPending ? t("submitting") : t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

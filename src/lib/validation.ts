import { z } from "zod";

export const setupSchema = z
  .object({
    clientName: z.string().min(1, "Nome é obrigatório"),
    currentAge: z
      .number()
      .int()
      .min(18, "Idade mínima: 18")
      .max(80, "Idade máxima: 80"),
    retirementAge: z
      .number()
      .int()
      .min(19, "Idade de reforma mínima: 19")
      .max(80),
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

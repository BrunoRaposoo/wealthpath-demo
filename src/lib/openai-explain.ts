import { createChatCompletion, DEFAULT_MODEL } from "@/lib/openai";
import type { ScenarioSummary } from "@/types";

type AppLocale = "pt-BR" | "en-GB";

const PROMPTS: Record<
  AppLocale,
  {
    system: string;
    body: (a: ScenarioSummary, b: ScenarioSummary) => string;
  }
> = {
  "pt-BR": {
    system: "És um consultor financeiro profissional.",
    body: (a, b) =>
      `És um consultor financeiro. Explica de forma clara e curta (máx 3 frases) a diferença entre estes dois cenários de aposentadoria.\n\nCenário A (${a.label}):\n- Idade de aposentadoria: ${a.retirementAge}\n- Contribuição mensal: €${a.monthlyContribution}\n- Património final: €${a.finalNetWorth}\n- Anos até aposentadoria: ${a.yearsToRetirement}\n\nCenário B (${b.label}):\n- Idade de aposentadoria: ${b.retirementAge}\n- Contribuição mensal: €${b.monthlyContribution}\n- Património final: €${b.finalNetWorth}\n- Anos até aposentadoria: ${b.yearsToRetirement}\n\nFoca-te no impacto no património final e no risco de longevidade. Responde em português.`,
  },
  "en-GB": {
    system: "You are a professional financial consultant.",
    body: (a, b) =>
      `You are a financial consultant. Explain clearly and briefly (max 3 sentences) the difference between these two retirement scenarios.\n\nScenario A (${a.label}):\n- Retirement age: ${a.retirementAge}\n- Monthly contribution: €${a.monthlyContribution}\n- Final net worth: €${a.finalNetWorth}\n- Years to retirement: ${a.yearsToRetirement}\n\nScenario B (${b.label}):\n- Retirement age: ${b.retirementAge}\n- Monthly contribution: €${b.monthlyContribution}\n- Final net worth: €${b.finalNetWorth}\n- Years to retirement: ${b.yearsToRetirement}\n\nFocus on the impact on final net worth and longevity risk. Respond in English.`,
  },
};

export async function generateExplanation(
  scenarioA: ScenarioSummary,
  scenarioB: ScenarioSummary,
  locale: AppLocale = "pt-BR",
): Promise<string> {
  const p = PROMPTS[locale];
  try {
    const response = await createChatCompletion({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: p.system },
        { role: "user", content: p.body(scenarioA, scenarioB) },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const choice = response.choices?.[0];
    const content = choice?.message?.content ?? "";
    if (choice?.finish_reason === "length") {
      console.warn(
        "[ai-explain] resposta truncada por limite de tokens (finish_reason=length)",
      );
    }
    return content;
  } catch {
    return "";
  }
}

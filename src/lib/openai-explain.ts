import { createChatCompletion } from "@/lib/openai";
import type { ScenarioSummary } from "@/types";

export async function generateExplanation(
  scenarioA: ScenarioSummary,
  scenarioB: ScenarioSummary,
): Promise<string> {
  const prompt = `És um consultor financeiro. Explica de forma clara e curta (máx 3 frases) a diferença entre estes dois cenários de reforma.

Cenário A (${scenarioA.label}):
- Idade de reforma: ${scenarioA.retirementAge}
- Contribuição mensal: €${scenarioA.monthlyContribution}
- Património final: €${scenarioA.finalNetWorth}
- Anos até reforma: ${scenarioA.yearsToRetirement}

Cenário B (${scenarioB.label}):
- Idade de reforma: ${scenarioB.retirementAge}
- Contribuição mensal: €${scenarioB.monthlyContribution}
- Património final: €${scenarioB.finalNetWorth}
- Anos até reforma: ${scenarioB.yearsToRetirement}

Foca-te no impacto no património final e no risco de longevidade. Responde em português.`;

  try {
    const response = await createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "És um consultor financeiro profissional." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    return response.choices?.[0]?.message?.content ?? "";
  } catch {
    return "";
  }
}

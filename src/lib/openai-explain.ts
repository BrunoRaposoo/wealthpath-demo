import { createChatCompletion, DEFAULT_MODEL } from "@/lib/openai";
import type { ScenarioSummary } from "@/types";

export async function generateExplanation(
  scenarioA: ScenarioSummary,
  scenarioB: ScenarioSummary,
): Promise<string> {
  const prompt = `És um consultor financeiro. Explica de forma clara e curta (máx 3 frases) a diferença entre estes dois cenários de aposentadoria.

Cenário A (${scenarioA.label}):
- Idade de aposentadoria: ${scenarioA.retirementAge}
- Contribuição mensal: €${scenarioA.monthlyContribution}
- Património final: €${scenarioA.finalNetWorth}
- Anos até aposentadoria: ${scenarioA.yearsToRetirement}

Cenário B (${scenarioB.label}):
- Idade de aposentadoria: ${scenarioB.retirementAge}
- Contribuição mensal: €${scenarioB.monthlyContribution}
- Património final: €${scenarioB.finalNetWorth}
- Anos até aposentadoria: ${scenarioB.yearsToRetirement}

Foca-te no impacto no património final e no risco de longevidade. Responde em português.`;

  try {
    const response = await createChatCompletion({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "És um consultor financeiro profissional." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
      reasoning: { effort: "low" },
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

import { NextResponse } from "next/server";
import { generateExplanation } from "@/lib/openai-explain";
import { explainSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = explainSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { scenarioA, scenarioB, locale } = parsed.data;
    const explanation = await generateExplanation(scenarioA, scenarioB, locale);

    return NextResponse.json({ explanation });
  } catch {
    return NextResponse.json({ explanation: "" });
  }
}

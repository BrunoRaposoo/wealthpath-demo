import { NextResponse } from "next/server";
import { explainSchema } from "@/lib/validation";
import { generateExplanation } from "@/lib/openai-explain";

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

    const { scenarioA, scenarioB } = parsed.data;
    const explanation = await generateExplanation(scenarioA, scenarioB);

    return NextResponse.json({ explanation });
  } catch {
    return NextResponse.json({ explanation: "" });
  }
}

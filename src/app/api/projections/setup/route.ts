import { NextResponse } from "next/server";
import { getExpectedReturn } from "@/lib/eodhd-market";
import { setupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = setupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { riskProfile } = parsed.data;
    const marketData = await getExpectedReturn(riskProfile);

    return NextResponse.json(marketData);
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

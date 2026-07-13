import type {
  EodhdFundamental,
  EodhdHistoricalData,
  EodhdQuote,
  EodhdQuoteParams,
  EodhdSearchParams,
} from "./types";

const EODHD_BASE_URL = "https://eodhd.com/api";

function getApiKey(): string {
  const apiKey = process.env.EODHD_API_KEY;
  if (!apiKey) {
    throw new Error("EODHD_API_KEY environment variable is not set");
  }
  return apiKey;
}

async function fetchEodhd<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const apiKey = getApiKey();
  const searchParams = new URLSearchParams({
    api_token: apiKey,
    fmt: "json",
    ...params,
  });

  const url = `${EODHD_BASE_URL}${endpoint}?${searchParams.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `EODHD API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function searchSymbols(params: EodhdSearchParams): Promise<{
  symbols: Array<{ Code: string; Exchange: string; Name: string }>;
}> {
  return fetchEodhd("/search", {
    q: params.q,
    limit: String(params.limit ?? 10),
  });
}

export async function getRealtimeQuote(
  params: EodhdQuoteParams,
): Promise<EodhdQuote[]> {
  const symbols = params.symbols.join(",");
  return fetchEodhd(`/realtime/${symbols}`, {
    s: symbols,
  });
}

export async function getHistoricalData(
  symbol: string,
  from: string,
  to: string,
): Promise<EodhdHistoricalData[]> {
  return fetchEodhd(`/eod/${symbol}`, {
    from,
    to,
  });
}

export async function getFundamentalData(
  symbol: string,
): Promise<EodhdFundamental> {
  return fetchEodhd(`/fundamentals/${symbol}`);
}

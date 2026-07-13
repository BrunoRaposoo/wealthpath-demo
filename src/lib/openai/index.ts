import type {
  OpenAIChatCompletionRequest,
  OpenAIChatCompletionResponse,
} from "./types";

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

export const DEFAULT_MODEL =
  process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free";

function getApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }
  return apiKey;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getApiKey()}`,
  };

  const siteUrl = process.env.OPENROUTER_SITE_URL;
  if (siteUrl) {
    headers["HTTP-Referer"] = siteUrl;
  }

  const siteName = process.env.OPENROUTER_SITE_NAME;
  if (siteName) {
    headers["X-Title"] = siteName;
  }

  return headers;
}

export async function createChatCompletion(
  request: OpenAIChatCompletionRequest,
): Promise<OpenAIChatCompletionResponse> {
  const body = { ...request, model: request.model ?? DEFAULT_MODEL };

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      `OpenRouter API error: ${response.status} ${response.statusText}${
        error ? ` - ${JSON.stringify(error)}` : ""
      }`,
    );
  }

  return response.json() as Promise<OpenAIChatCompletionResponse>;
}

export async function* streamChatCompletion(
  request: OpenAIChatCompletionRequest,
): AsyncGenerator<string, void, unknown> {
  const body = {
    ...request,
    model: request.model ?? DEFAULT_MODEL,
    stream: true,
  };

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      `OpenRouter API error: ${response.status} ${response.statusText}${
        error ? ` - ${JSON.stringify(error)}` : ""
      }`,
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        const trimmed = line.replace(/^data: /, "");
        if (trimmed === "[DONE]") return;

        try {
          const parsed = JSON.parse(trimmed) as {
            choices: Array<{ delta: { content?: string } }>;
          };
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

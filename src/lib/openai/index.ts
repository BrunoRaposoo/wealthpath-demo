import type {
  OpenAIChatCompletionRequest,
  OpenAIChatCompletionResponse,
} from "./types";

const OPENAI_BASE_URL = "https://api.openai.com/v1";

function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return apiKey;
}

export async function createChatCompletion(
  request: OpenAIChatCompletionRequest,
): Promise<OpenAIChatCompletionResponse> {
  const apiKey = getApiKey();

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      `OpenAI API error: ${response.status} ${response.statusText}${
        error ? ` - ${JSON.stringify(error)}` : ""
      }`,
    );
  }

  return response.json() as Promise<OpenAIChatCompletionResponse>;
}

export async function* streamChatCompletion(
  request: OpenAIChatCompletionRequest,
): AsyncGenerator<string, void, unknown> {
  const apiKey = getApiKey();

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      `OpenAI API error: ${response.status} ${response.statusText}${
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

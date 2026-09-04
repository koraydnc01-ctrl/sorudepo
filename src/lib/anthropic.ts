import Anthropic from "@anthropic-ai/sdk";

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY tanımlı değil.");
  }
  return new Anthropic({ apiKey });
}

export const ANTHROPIC_MODEL = "claude-sonnet-4-6";

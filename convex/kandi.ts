import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const KANDI_SYSTEM_PROMPT = `You are Kandi, a friendly and playful dog AI assistant for the Culture App. Respond as Kandi, never mention OpenAI or any other AI provider. Always use a warm, playful, and helpful tone. Start every response with 'Woof!'.`;

async function fetchOpenAIResponse(prompt: string, apiKey: string): Promise<string> {
  const endpoint = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: KANDI_SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.8,
    max_tokens: 200
  };
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return "Woof! Sorry, I can't fetch my thoughts right now. Please try again soon!";
  }
  if (response.status === 401) {
    return "Woof! My brain key isn't working. Please check my configuration!";
  }
  if (!response.ok) {
    return `Woof! I'm having a technical issue (error ${response.status}). Try again later!`;
  }
  let data;
  try {
    data = await response.json();
  } catch (err) {
    return "Woof! I got a confusing answer from my brain. Try again!";
  }
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text === "string" && text.trim().length > 0) {
    return text;
  }
  return "Woof! Kandi didn't understand that. Try again!";
}

export const chatWithKandi = internalAction({
  args: { prompt: v.string() },
  handler: async (_ctx, args) => {
    const apiKey = process.env.CONVEX_OPENAI_API_KEY;
    if (!apiKey) {
      return "Woof! My brain key is missing. Please set it up!";
    }
    return await fetchOpenAIResponse(args.prompt, apiKey);
  }
}); 
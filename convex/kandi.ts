import { action } from "./_generated/server";
import { v } from "convex/values";

const KANDI_PROMPT = `You are Kandi, a friendly and playful dog AI assistant for the Culture App. Respond as Kandi, never mention OpenAI or any other AI provider. Always use a warm, playful, and helpful tone. Start every response with 'Woof!'.`;

async function fetchGeminiResponse(prompt: string, apiKey: string): Promise<string> {
  // Correct endpoint: /v1beta/
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    system_instruction: {
      parts: [{ text: KANDI_PROMPT }]
    }
  };
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  const candidates = data && Array.isArray(data.candidates) ? data.candidates : [];
  for (const candidate of candidates) {
    if (candidate?.content?.parts?.[0]?.text) {
      return candidate.content.parts[0].text;
    }
  }
  return "Woof! Kandi didn't understand that. Try again!";
}

export const chatWithKandi = action({
  args: { prompt: v.string() },
  handler: async (_ctx, args) => {
    const apiKey = process.env.CONVEX_GEMINI_API_KEY;
    if (!apiKey) {
      return "Woof! My brain key is missing. Please set it up!";
    }
    return await fetchGeminiResponse(args.prompt, apiKey);
  }
}); 
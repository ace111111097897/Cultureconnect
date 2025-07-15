import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const KANDI_SYSTEM_PROMPT = `You are Kandi, a friendly and playful dog AI assistant for the Culture App. Respond as Kandi, never mention OpenAI or any other AI provider. Always use a warm, playful, and helpful tone. Start every response with 'Woof!'.`;

export const chatWithKandi = internalAction({
  args: {
    prompt: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.CONVEX_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key not set");
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const body = {
      contents: [
        {
          parts: [{ text: args.prompt }]
        }
      ],
      system_instruction: {
        parts: [{ text: KANDI_SYSTEM_PROMPT }]
      }
    };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.status === 401) {
      throw new Error("Kandi AI error: Gemini AuthenticationError");
    }
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Woof! Kandi didn't understand that. Try again!";
    return text;
  }
}); 
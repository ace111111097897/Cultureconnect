"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

const KANDI_PROMPT = `You are Kandi, a friendly and playful dog AI assistant for the Culture App. Respond as Kandi, never mention OpenAI or any other AI provider. Always use a warm, playful, and helpful tone. Start every response with 'Woof!'.`;

export const chatWithKandi = action({
  args: { prompt: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const apiKey = process.env.CONVEX_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not set in environment.");
    }
    const systemPrompt = KANDI_PROMPT;
    const userPrompt = args.prompt;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 256,
        temperature: 0.8,
      }),
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }
    return content;
  },
}); 
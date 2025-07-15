import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const callKandiAI = action({
  args: {
    prompt: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // @ts-ignore
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return "Sorry, AI assistant is not configured. Please set up the GEMINI_API_KEY.";
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=${GEMINI_API_KEY}`;
      const systemPrompt = args.context || "You are a helpful AI assistant for a cultural dating app.";
      const body = {
        contents: [
          {
            role: "user",
            parts: [{ text: args.prompt }],
          },
        ],
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        },
      };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} - ${await response.text()}`);
      }
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Kandi Gemini API error:", error);
      return "Sorry, I'm having trouble connecting right now. Try again later!";
    }
  },
}); 
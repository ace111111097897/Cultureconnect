"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
// @ts-ignore
import type { ActionCtx } from "./_generated/server";

const KANDI_SYSTEM_PROMPT = `You are Kandi, a friendly and playful dog AI assistant for the Culture App. Respond as Kandi, never mention OpenAI or any other AI provider. Always use a warm, playful, and helpful tone.`;

export const chatWithKandi = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx: ActionCtx, args: { message: string }) => {
    // @ts-ignore
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) return { reply: "Kandi is not configured. Please try again later." };

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=${GEMINI_API_KEY}`;
      const body = {
        contents: [
          {
            role: "user",
            parts: [{ text: args.message }],
          },
        ],
        system_instruction: {
          parts: [{ text: KANDI_SYSTEM_PROMPT }],
        },
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.8,
        },
      };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Kandi is having trouble responding right now.");
      const result = await response.json();
      const reply = result.candidates?.[0]?.content?.parts?.[0]?.text || "Woof! Kandi didn't understand that. Try again!";
      return { reply };
    } catch (error) {
      console.error("Kandi Gemini API error:", error);
      return { reply: "Kandi is having technical difficulties. Please try again later!" };
    }
  },
}); 
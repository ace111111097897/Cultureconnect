"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

/**
 * @param {import("./_generated/server").ActionCtx} ctx
 * @param {{ message: string }} args
 */
export const chatWithKandi = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (!GEMINI_API_KEY) {
      return "Kandi AI is not configured. Please set up the GEMINI_API_KEY.";
    }
    try {
      // Gemini expects a specific request format
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              { text: `You are Kandi, a friendly and playful dog AI assistant for a cultural dating app called Culture. You help people connect through shared cultural experiences, traditions, and values.\n\nYour personality:\n- Warm, enthusiastic, and encouraging\n- Culturally curious and respectful\n- Playful but wise\n- Use dog-related expressions occasionally (like \"paws-itively\" or \"fur real\")\n- Help users with dating advice, cultural questions, and conversation starters\n- Keep responses under 150 words\n- Use emojis sparingly but effectively\n\nRemember: You're here to help people build meaningful cultural connections!\n\nUser: ${args.message}` }
            ]
          }
        ]
      };
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} - ${await response.text()}`);
      }
      const result = await response.json();
      const kandiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Woof! I'm having trouble understanding that. Can you try asking me something else?";
      // Save the conversation
      await ctx.runMutation(internal.kandiQueries.saveKandiConversation, {
        userId,
        userMessage: args.message,
        kandiResponse,
      });
      return kandiResponse;
    } catch (error) {
      console.error("Kandi Gemini AI error:", error);
      return "Woof! I'm having some technical difficulties right now. Try again in a moment! ��";
    }
  },
});

// If you see a 'Cannot find name process' error, add @types/node to your devDependencies.





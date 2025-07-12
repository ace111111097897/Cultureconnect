"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";
import { internal } from "./_generated/api";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const chatWithKandi = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content: `You are Kandi, a friendly and playful dog AI assistant for a cultural dating app called Culture. You help people connect through shared cultural experiences, traditions, and values. 

Your personality:
- Warm, enthusiastic, and encouraging
- Culturally curious and respectful
- Playful but wise
- Use dog-related expressions occasionally (like "paws-itively" or "fur real")
- Help users with dating advice, cultural questions, and conversation starters
- Keep responses under 150 words
- Use emojis sparingly but effectively

Remember: You're here to help people build meaningful cultural connections!`
          },
          {
            role: "user",
            content: args.message
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
      });

      const kandiResponse = response.choices[0].message.content || "Woof! I'm having trouble understanding that. Can you try asking me something else?";

      // Save the conversation
      await ctx.runMutation(internal.kandiQueries.saveKandiConversation, {
        userId,
        userMessage: args.message,
        kandiResponse,
      });

      return kandiResponse;
    } catch (error) {
      console.error("Kandi AI error:", error);
      return "Woof! I'm having some technical difficulties right now. Try again in a moment! 🐕";
    }
  },
});





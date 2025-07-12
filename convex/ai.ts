"use node";

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

    const apiKey = process.env.KANDI_API_KEY;
    if (!apiKey) {
      return "Sorry, AI assistant is not configured. Please set up the KANDI_API_KEY.";
    }

    try {
      const requestData = {
        prompt: args.prompt,
        context: args.context || "You are a helpful AI assistant for a cultural dating app.",
        max_tokens: 150,
        temperature: 0.7,
      };

      const response = await fetch('https://api.kandi.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${await response.text()}`);
      }

      const result = await response.json();
      return result.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Kandi AI API error:", error);
      return "Sorry, I'm having trouble connecting right now. Try again later!";
    }
  },
});

export const generateConversationStarter = action({
  args: {
    userProfile: v.object({
      culturalBackground: v.array(v.string()),
      interests: v.array(v.string()),
      values: v.array(v.string()),
    }),
    matchProfile: v.object({
      culturalBackground: v.array(v.string()),
      interests: v.array(v.string()),
      values: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sharedInterests = args.userProfile.interests.filter(interest => 
      args.matchProfile.interests.includes(interest)
    );

    const sharedValues = args.userProfile.values.filter(value => 
      args.matchProfile.values.includes(value)
    );

    const sharedCulture = args.userProfile.culturalBackground.filter(bg => 
      args.matchProfile.culturalBackground.includes(bg)
    );

    const context = `Generate a thoughtful conversation starter for two people who share these commonalities:
    - Shared cultural backgrounds: ${sharedCulture.join(", ")}
    - Shared interests: ${sharedInterests.join(", ")}
    - Shared values: ${sharedValues.join(", ")}
    
    Make it personal, culturally sensitive, and engaging. Keep it under 100 words.`;

    const fallbackPrompts = [
      "What's your favorite cultural tradition and why?",
      "I noticed we share some common interests - what's your story?",
      "What values are most important to you?",
    ];
    return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
  },
});

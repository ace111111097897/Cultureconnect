"use node";
import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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

// Persistent Kandi chat history
export const addKandiMessage = mutation({
  args: { from: v.union(v.literal("user"), v.literal("kandi")), text: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("kandiChats", {
      userId,
      from: args.from,
      text: args.text,
      timestamp: Date.now(),
    });
  },
});

export const getKandiChat = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const messages = await ctx.db
      .query("kandiChats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
    return messages;
  },
}); 
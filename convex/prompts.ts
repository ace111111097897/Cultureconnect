import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCulturalPrompts = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("culturalPrompts")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .take(5);
    } else {
      return await ctx.db
        .query("culturalPrompts")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .take(5);
    }
  },
});

export const submitPromptResponse = mutation({
  args: {
    promptId: v.id("culturalPrompts"),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already responded to this prompt
    const existingResponse = await ctx.db
      .query("promptResponses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("promptId"), args.promptId))
      .unique();

    if (existingResponse) {
      // Update existing response
      await ctx.db.patch(existingResponse._id, {
        response: args.response,
        timestamp: Date.now(),
      });
      return existingResponse._id;
    } else {
      // Create new response
      return await ctx.db.insert("promptResponses", {
        userId,
        promptId: args.promptId,
        response: args.response,
        timestamp: Date.now(),
      });
    }
  },
});

export const getUserPromptResponses = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const responses = await ctx.db
      .query("promptResponses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get prompt details for each response
    const responsesWithPrompts = await Promise.all(
      responses.map(async (response) => {
        const prompt = await ctx.db.get(response.promptId);
        return {
          ...response,
          prompt,
        };
      })
    );

    return responsesWithPrompts;
  },
});

// Seed initial cultural prompts
export const seedCulturalPrompts = mutation({
  args: {},
  handler: async (ctx) => {
    const prompts = [
      {
        question: "What cultural tradition means the most to you?",
        category: "traditions",
        options: ["Family gatherings", "Religious ceremonies", "Cultural festivals", "Food traditions", "Music and dance"],
        isActive: true,
      },
      {
        question: "Which cuisine best represents your cultural identity?",
        category: "food",
        options: ["Mediterranean", "Asian", "Latin American", "African", "Middle Eastern", "European"],
        isActive: true,
      },
      {
        question: "What values guide your daily life?",
        category: "values",
        options: ["Family first", "Community service", "Personal growth", "Spiritual connection", "Cultural preservation"],
        isActive: true,
      },
      {
        question: "How do you prefer to connect with your heritage?",
        category: "heritage",
        options: ["Language practice", "Traditional cooking", "Cultural events", "Music and arts", "Travel to homeland"],
        isActive: true,
      },
      {
        question: "What type of cultural experience excites you most?",
        category: "experiences",
        options: ["Food festivals", "Art exhibitions", "Music concerts", "Language exchanges", "Cultural workshops"],
        isActive: true,
      },
    ];

    for (const prompt of prompts) {
      await ctx.db.insert("culturalPrompts", {
        ...prompt,
        createdAt: Date.now(),
      });
    }
  },
});

import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getKandiHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("kandiMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 20);
  },
});

export const saveKandiConversation = internalMutation({
  args: {
    userId: v.id("users"),
    userMessage: v.string(),
    kandiResponse: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("kandiMessages", {
      userId: args.userId,
      userMessage: args.userMessage,
      kandiResponse: args.kandiResponse,
      timestamp: Date.now(),
    });
  },
});

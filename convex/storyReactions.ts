import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addStoryReaction = mutation({
  args: {
    storyId: v.id("culturalStories"),
    reactionType: v.string(), // "❤️", "🔥", "👏", "😍", "🌟"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already reacted to this story
    const existingReaction = await ctx.db
      .query("storyReactions")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (existingReaction) {
      // Update existing reaction
      await ctx.db.patch(existingReaction._id, {
        reactionType: args.reactionType,
        timestamp: Date.now(),
      });
      return existingReaction._id;
    } else {
      // Create new reaction
      return await ctx.db.insert("storyReactions", {
        storyId: args.storyId,
        userId,
        reactionType: args.reactionType,
        timestamp: Date.now(),
      });
    }
  },
});

export const removeStoryReaction = mutation({
  args: {
    storyId: v.id("culturalStories"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const reaction = await ctx.db
      .query("storyReactions")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (reaction) {
      await ctx.db.delete(reaction._id);
    }
  },
});

export const getStoryReactions = query({
  args: {
    storyId: v.id("culturalStories"),
  },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("storyReactions")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect();

    // Group reactions by type and count them
    const reactionCounts: Record<string, number> = {};
    const userReactions: Record<string, string> = {};

    for (const reaction of reactions) {
      reactionCounts[reaction.reactionType] = (reactionCounts[reaction.reactionType] || 0) + 1;
      
      // Get user profile for this reaction
      const userProfile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", reaction.userId))
        .unique();
      
      if (userProfile) {
        userReactions[reaction.userId] = reaction.reactionType;
      }
    }

    return {
      reactionCounts,
      userReactions,
      totalReactions: reactions.length,
    };
  },
});

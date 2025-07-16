import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createReel = mutation({
  args: {
    video: v.id("_storage"),
    caption: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("reels", {
      userId,
      video: args.video,
      caption: args.caption,
      likes: 0,
      comments: 0,
      timestamp: Date.now(),
      isPublic: args.isPublic,
    });
  },
});

export const getPublicReels = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const reels = await ctx.db
      .query("reels")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(args.limit || 20);

    // Get user profiles and video URLs, skip if missing
    const reelsWithDetails = [];
    for (const reel of reels) {
      let user = null;
      try {
        user = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", reel.userId))
          .unique();
      } catch (e) {
        // Skip if no user profile
        continue;
      }
      const videoUrl = await ctx.storage.getUrl(reel.video);
      if (!videoUrl) continue; // Skip if video is missing
      reelsWithDetails.push({
        ...reel,
        user,
        videoUrl,
      });
    }
    return reelsWithDetails;
  },
});

export const generateVideoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
}); 
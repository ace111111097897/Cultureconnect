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

export const getReels = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const reels = await ctx.db
      .query("reels")
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
        continue;
      }
      const videoUrl = await ctx.storage.getUrl(reel.video);
      if (!videoUrl) continue;
      // Get like count
      const likeCount = await ctx.db
        .query("reelLikes")
        .withIndex("by_reel", (q) => q.eq("reelId", reel._id))
        .collect();
      reelsWithDetails.push({
        ...reel,
        user,
        videoUrl,
        likeCount: likeCount.length,
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

// --- Advanced: Likes ---
export const likeReel = mutation({
  args: { reelId: v.id("reels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    // Check if already liked
    const existing = await ctx.db
      .query("reelLikes")
      .withIndex("by_reel_and_user", (q) => q.eq("reelId", args.reelId).eq("userId", userId))
      .unique();
    if (existing) return; // Already liked
    await ctx.db.insert("reelLikes", { reelId: args.reelId, userId });
  },
});

export const unlikeReel = mutation({
  args: { reelId: v.id("reels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("reelLikes")
      .withIndex("by_reel_and_user", (q) => q.eq("reelId", args.reelId).eq("userId", userId))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const getReelLikeStatus = query({
  args: { reelId: v.id("reels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { liked: false, likeCount: 0 };
    const likeCount = await ctx.db
      .query("reelLikes")
      .withIndex("by_reel", (q) => q.eq("reelId", args.reelId))
      .collect();
    const liked = await ctx.db
      .query("reelLikes")
      .withIndex("by_reel_and_user", (q) => q.eq("reelId", args.reelId).eq("userId", userId))
      .unique();
    return { liked: !!liked, likeCount: likeCount.length };
  },
});

// --- Advanced: Comments ---
export const addComment = mutation({
  args: { reelId: v.id("reels"), text: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("reelComments", {
      reelId: args.reelId,
      userId,
      text: args.text,
      timestamp: Date.now(),
    });
  },
});

export const getComments = query({
  args: { reelId: v.id("reels") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("reelComments")
      .withIndex("by_reel", (q) => q.eq("reelId", args.reelId))
      .order("asc")
      .collect();
    // Attach user info
    const withUser = await Promise.all(
      comments.map(async (c) => {
        const user = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", c.userId))
          .unique();
        return { ...c, user };
      })
    );
    return withUser;
  },
}); 
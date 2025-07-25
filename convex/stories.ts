import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Default user ID for demo purposes
const DEFAULT_USER_ID = "demo_user_123" as any;

export const createCulturalStory = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    isPublic: v.boolean(),
    images: v.optional(v.array(v.id("_storage"))),
    videos: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = DEFAULT_USER_ID;

    return await ctx.db.insert("culturalStories", {
      userId,
      title: args.title,
      content: args.content,
      category: args.category,
      isPublic: args.isPublic,
      images: args.images || [],
      videos: args.videos || [],
      likes: 0,
      timestamp: Date.now(),
    });
  },
});

export const getCulturalStories = query({
  args: {
    category: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query;

    if (args.userId) {
      query = ctx.db.query("culturalStories").withIndex("by_user", (q) => q.eq("userId", args.userId!));
    } else {
      query = ctx.db.query("culturalStories").withIndex("by_public", (q) => q.eq("isPublic", true));
    }

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    const stories = await query
      .order("desc")
      .take(args.limit || 20);

    // Get author profiles and media URLs
    const storiesWithDetails = await Promise.all(
      stories.map(async (story) => {
        const authorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", story.userId))
          .unique();

        const imageUrls = story.images 
          ? await Promise.all(story.images.map(id => ctx.storage.getUrl(id)))
          : [];

        const videoUrls = story.videos
          ? await Promise.all(story.videos.map(id => ctx.storage.getUrl(id)))
          : [];

        return {
          ...story,
          author: authorProfile,
          imageUrls: imageUrls.filter(Boolean),
          videoUrls: videoUrls.filter(Boolean),
        };
      })
    );

    return storiesWithDetails;
  },
});

export const likeCulturalStory = mutation({
  args: {
    storyId: v.id("culturalStories"),
  },
  handler: async (ctx, args) => {
    const userId = DEFAULT_USER_ID;

    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");

    await ctx.db.patch(args.storyId, {
      likes: story.likes + 1,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const generateVideoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

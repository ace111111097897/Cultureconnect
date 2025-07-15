import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";

// Get published news articles
export const getNewsArticles = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("newsArticles"),
    _creationTime: v.number(),
    title: v.string(),
    content: v.string(),
    summary: v.string(),
    category: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    images: v.optional(v.array(v.id("_storage"))),
    tags: v.array(v.string()),
    likes: v.number(),
    views: v.number(),
    isPublished: v.boolean(),
    publishedAt: v.optional(v.number()),
    timestamp: v.number(),
    isLikedByUser: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    let articlesQuery = ctx.db
      .query("newsArticles")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .order("desc");

    if (args.category) {
      articlesQuery = articlesQuery.filter((q) => q.eq(q.field("category"), args.category));
    }

    const articles = await articlesQuery.collect();
    
    // Get author names and check if user liked each article
    const articlesWithDetails = await Promise.all(
      articles.map(async (article) => {
        const author = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", article.authorId))
          .unique();

        let isLikedByUser = false;
        if (userId) {
          const like = await ctx.db
            .query("newsLikes")
            .withIndex("by_article", (q) => q.eq("articleId", article._id))
            .filter((q) => q.eq(q.field("userId"), userId))
            .unique();
          isLikedByUser = !!like;
        }

        return {
          ...article,
          authorName: author?.displayName || "Anonymous",
          isLikedByUser,
        };
      })
    );

    // Apply pagination
    const start = args.offset || 0;
    const end = start + (args.limit || 10);
    return articlesWithDetails.slice(start, end);
  },
});

// Get user's own articles
export const getUserArticles = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("newsArticles"),
    _creationTime: v.number(),
    title: v.string(),
    content: v.string(),
    summary: v.string(),
    category: v.string(),
    authorId: v.id("users"),
    images: v.optional(v.array(v.id("_storage"))),
    tags: v.array(v.string()),
    likes: v.number(),
    views: v.number(),
    isPublished: v.boolean(),
    publishedAt: v.optional(v.number()),
    timestamp: v.number(),
  })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const articles = await ctx.db
      .query("newsArticles")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();

    return articles;
  },
});

// Create a new news article
export const createNewsArticle = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    summary: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
    isPublished: v.boolean(),
  },
  returns: v.id("newsArticles"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!args.title.trim() || !args.content.trim()) {
      throw new Error("Title and content are required");
    }

    return await ctx.db.insert("newsArticles", {
      title: args.title,
      content: args.content,
      summary: args.summary,
      category: args.category,
      authorId: userId,
      images: args.images,
      tags: args.tags,
      likes: 0,
      views: 0,
      isPublished: args.isPublished,
      publishedAt: args.isPublished ? Date.now() : undefined,
      timestamp: Date.now(),
    });
  },
});

// Update a news article
export const updateNewsArticle = mutation({
  args: {
    articleId: v.id("newsArticles"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    summary: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.id("_storage"))),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error("Article not found");

    if (article.authorId !== userId) {
      throw new Error("You can only edit your own articles");
    }

    const updateData: any = {};
    
    if (args.title !== undefined) updateData.title = args.title;
    if (args.content !== undefined) updateData.content = args.content;
    if (args.summary !== undefined) updateData.summary = args.summary;
    if (args.category !== undefined) updateData.category = args.category;
    if (args.tags !== undefined) updateData.tags = args.tags;
    if (args.images !== undefined) updateData.images = args.images;
    
    if (args.isPublished !== undefined) {
      updateData.isPublished = args.isPublished;
      if (args.isPublished && !article.publishedAt) {
        updateData.publishedAt = Date.now();
      }
    }

    await ctx.db.patch(args.articleId, updateData);
    return true;
  },
});

// Delete a news article
export const deleteNewsArticle = mutation({
  args: {
    articleId: v.id("newsArticles"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error("Article not found");

    if (article.authorId !== userId) {
      throw new Error("You can only delete your own articles");
    }

    // Delete associated likes
    const likes = await ctx.db
      .query("newsLikes")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    await ctx.db.delete(args.articleId);
    return true;
  },
});

// Like/unlike a news article
export const toggleNewsLike = mutation({
  args: {
    articleId: v.id("newsArticles"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error("Article not found");

    const existingLike = await ctx.db
      .query("newsLikes")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.articleId, {
        likes: article.likes - 1,
      });
      return false;
    } else {
      // Like
      await ctx.db.insert("newsLikes", {
        articleId: args.articleId,
        userId,
        timestamp: Date.now(),
      });
      await ctx.db.patch(args.articleId, {
        likes: article.likes + 1,
      });
      return true;
    }
  },
});

// Increment article views
export const incrementArticleViews = mutation({
  args: {
    articleId: v.id("newsArticles"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error("Article not found");

    await ctx.db.patch(args.articleId, {
      views: article.views + 1,
    });

    return true;
  },
});

// Get trending articles
export const getTrendingArticles = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("newsArticles"),
    _creationTime: v.number(),
    title: v.string(),
    summary: v.string(),
    category: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    likes: v.number(),
    views: v.number(),
    publishedAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("newsArticles")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .order("desc")
      .collect();

    // Calculate trending score (likes + views/10)
    const articlesWithScore = articles.map(article => ({
      ...article,
      trendingScore: article.likes + (article.views / 10),
    }));

    // Sort by trending score
    articlesWithScore.sort((a, b) => b.trendingScore - a.trendingScore);

    // Get author names
    const trendingArticles = await Promise.all(
      articlesWithScore.slice(0, args.limit || 5).map(async (article) => {
        const author = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", article.authorId))
          .unique();

        return {
          _id: article._id,
          _creationTime: article._creationTime,
          title: article.title,
          summary: article.summary,
          category: article.category,
          authorId: article.authorId,
          authorName: author?.displayName || "Anonymous",
          likes: article.likes,
          views: article.views,
          publishedAt: article.publishedAt,
        };
      })
    );

    return trendingArticles;
  },
});

// Get articles by category
export const getArticlesByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("newsArticles"),
    _creationTime: v.number(),
    title: v.string(),
    summary: v.string(),
    category: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    likes: v.number(),
    views: v.number(),
    publishedAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("newsArticles")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .order("desc")
      .collect();

    const articlesWithAuthors = await Promise.all(
      articles.slice(0, args.limit || 10).map(async (article) => {
        const author = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", article.authorId))
          .unique();

        return {
          _id: article._id,
          _creationTime: article._creationTime,
          title: article.title,
          summary: article.summary,
          category: article.category,
          authorId: article.authorId,
          authorName: author?.displayName || "Anonymous",
          likes: article.likes,
          views: article.views,
          publishedAt: article.publishedAt,
        };
      })
    );

    return articlesWithAuthors;
  },
}); 
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new user
export const createUser = mutation({
  args: {
    displayName: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      displayName: args.displayName,
      email: args.email,
      createdAt: Date.now(),
      lastActive: Date.now(),
    });
    return userId;
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
    return users[0] || null;
  },
});

// Update user last active
export const updateLastActive = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastActive: Date.now(),
    });
  },
});

// Get or create user (for demo purposes, always returns a default user)
export const getOrCreateDefaultUser = query({
  handler: async (ctx) => {
    // For demo purposes, always return a default user ID
    // In a real app, you'd implement proper user management
    const defaultUserId = "demo_user_123" as any;
    return defaultUserId;
  },
});

// List all users (for debugging/demo)
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Query to get user active status
export const getUserActiveStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return { active: false };
    // Consider active if lastActive is within 2 minutes
    const now = Date.now();
    const isActive = user.lastActive && now - user.lastActive < 2 * 60 * 1000;
    return { active: !!isActive };
  },
});

// Batch query to get active status for many users
export const getManyUserActiveStatuses = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const result: Record<string, { active: boolean }> = {};
    for (const userId of args.userIds) {
      const user = await ctx.db.get(userId);
      const isActive = user?.lastActive && now - user.lastActive < 2 * 60 * 1000;
      result[userId] = { active: !!isActive };
    }
    return result;
  },
}); 
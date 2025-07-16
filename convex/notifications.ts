import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    relatedUserId: v.optional(v.id("users")),
    relatedStoryId: v.optional(v.id("culturalStories")),
    relatedConversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      relatedUserId: args.relatedUserId,
      relatedStoryId: args.relatedStoryId,
      relatedConversationId: args.relatedConversationId,
      isRead: false,
      timestamp: Date.now(),
    });
  },
});

export const getUserNotifications = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 20);

    // Get related user profiles for notifications
    const notificationsWithProfiles = await Promise.all(
      notifications.map(async (notification) => {
        let relatedUserProfile = null;
        if (notification.relatedUserId) {
          const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", notification.relatedUserId!))
            .unique();
          if (profile) {
            const profileImageUrl = profile.profileImage 
              ? await ctx.storage.getUrl(profile.profileImage)
              : null;
            relatedUserProfile = {
              ...profile,
              profileImageUrl,
            };
          }
        }
        return {
          ...notification,
          relatedUserProfile,
        };
      })
    );

    return notificationsWithProfiles;
  },
});

export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or not authorized");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });
  },
});

export const markAllNotificationsAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    // Update all unread notifications
    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
      });
    }
  },
});

export const getUnreadNotificationCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unreadNotifications.length;
  },
});

export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or not authorized");
    }

    await ctx.db.delete(args.notificationId);
  },
}); 
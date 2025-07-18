import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Simple notification system that works without complex internal calls
export const createNotification = mutation({
  args: {
    type: v.union(
      v.literal("match"),
      v.literal("friend_request"),
      v.literal("message"),
      v.literal("profile_update"),
      v.literal("event"),
      v.literal("kandi")
    ),
    title: v.string(),
    message: v.string(),
    targetUserId: v.string(),
    relatedUserId: v.optional(v.string()),
    relatedProfileId: v.optional(v.id("profiles")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("notifications", {
      type: args.type,
      title: args.title,
      message: args.message,
      targetUserId: args.targetUserId,
      relatedUserId: args.relatedUserId,
      relatedProfileId: args.relatedProfileId,
      read: false,
      createdAt: Date.now(),
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
      .withIndex("by_target_user", (q) => q.eq("targetUserId", userId))
      .order("desc")
      .take(args.limit || 20);

    // Get related profile information for notifications
    const notificationsWithProfiles = await Promise.all(
      notifications.map(async (notification) => {
        let relatedProfile = null;
        if (notification.relatedProfileId) {
          relatedProfile = await ctx.db.get(notification.relatedProfileId);
        }

        return {
          ...notification,
          relatedProfile,
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

    await ctx.db.patch(args.notificationId, {
      read: true,
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
      .withIndex("by_target_user", (q) => q.eq("targetUserId", userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        read: true,
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
      .withIndex("by_target_user", (q) => q.eq("targetUserId", userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    return unreadNotifications.length;
  },
});

// Simple function to create match notifications - called directly from matches.ts
export const createMatchNotifications = mutation({
  args: {
    user1Id: v.string(),
    user2Id: v.string(),
    user1Name: v.string(),
    user2Name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Create notification for user 1
    await ctx.db.insert("notifications", {
      type: "match",
      title: "New Match! 🎉",
      message: `You matched with ${args.user2Name}! Start a conversation to learn more about their cultural background.`,
      targetUserId: args.user1Id,
      relatedUserId: args.user2Id,
      read: false,
      createdAt: Date.now(),
    });

    // Create notification for user 2
    await ctx.db.insert("notifications", {
      type: "match",
      title: "New Match! 🎉",
      message: `You matched with ${args.user1Name}! Start a conversation to learn more about their cultural background.`,
      targetUserId: args.user2Id,
      relatedUserId: args.user1Id,
      read: false,
      createdAt: Date.now(),
    });
  },
});

// Simple function to create profile update notifications
export const createProfileUpdateNotification = mutation({
  args: {
    profileId: v.id("profiles"),
    updateType: v.union(
      v.literal("photo"),
      v.literal("bio"),
      v.literal("interests"),
      v.literal("location")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db.get(args.profileId);
    if (!profile) return;

    // Get users who might be interested in this profile update
    const interestedUsers = await ctx.db
      .query("profiles")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => 
        q.and(
          q.neq(q.field("userId"), userId),
          q.or(
            // Users with similar cultural background
            q.gt(q.field("culturalBackground"), []),
            // Users with similar interests
            q.gt(q.field("foodPreferences"), []),
            q.gt(q.field("musicGenres"), [])
          )
        )
      )
      .take(10);

    const updateMessages = {
      photo: "updated their profile picture",
      bio: "updated their bio",
      interests: "updated their interests",
      location: "updated their location"
    };

    // Create notifications for interested users
    for (const interestedUser of interestedUsers) {
      await ctx.db.insert("notifications", {
        type: "profile_update",
        title: `${profile.displayName} ${updateMessages[args.updateType]}`,
        message: `Check out ${profile.displayName}'s latest update!`,
        targetUserId: interestedUser.userId,
        relatedUserId: userId,
        relatedProfileId: args.profileId,
        read: false,
        createdAt: Date.now(),
      });
    }
  },
}); 

// Create sample notifications for testing
export const createSampleNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sampleNotifications = [
      {
        type: "match" as const,
        title: "New Cultural Match! 🎉",
        message: "You matched with Sarah from Mediterranean culture",
        targetUserId: userId,
        read: false,
        createdAt: Date.now() - 120000, // 2 minutes ago
      },
      {
        type: "friend_request" as const,
        title: "Friend Request",
        message: "Alex wants to connect with you",
        targetUserId: userId,
        read: false,
        createdAt: Date.now() - 900000, // 15 minutes ago
      },
      {
        type: "event" as const,
        title: "Cultural Event Reminder",
        message: "Mediterranean cooking class starts in 1 hour",
        targetUserId: userId,
        read: true,
        createdAt: Date.now() - 3600000, // 1 hour ago
      },
      {
        type: "message" as const,
        title: "New Message",
        message: "Maria sent you a cultural story",
        targetUserId: userId,
        read: true,
        createdAt: Date.now() - 7200000, // 2 hours ago
      },
      {
        type: "kandi" as const,
        title: "Kandi AI Update",
        message: "Your AI companion has new cultural insights to share",
        targetUserId: userId,
        read: true,
        createdAt: Date.now() - 10800000, // 3 hours ago
      }
    ];

    for (const notification of sampleNotifications) {
      await ctx.db.insert("notifications", notification);
    }
  },
}); 
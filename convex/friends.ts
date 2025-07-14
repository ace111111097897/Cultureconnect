import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

export const sendFriendRequest = mutation({
  args: {
    toUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (userId === args.toUserId) {
      throw new Error("Cannot send friend request to yourself");
    }

    // Check if request already exists
    const existingRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", userId))
      .filter((q) => q.eq(q.field("toUserId"), args.toUserId))
      .unique();

    if (existingRequest) {
      throw new Error("Friend request already sent");
    }

    // Check if they're already friends
    const existingFriendship = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .filter((q) => q.eq(q.field("user2Id"), args.toUserId))
      .unique();

    const existingFriendship2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .filter((q) => q.eq(q.field("user1Id"), args.toUserId))
      .unique();

    if (existingFriendship || existingFriendship2) {
      throw new Error("Already friends");
    }

    // Get user profiles for email notification
    const senderProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const recipientProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.toUserId))
      .unique();

    const requestId = await ctx.db.insert("friendRequests", {
      fromUserId: userId,
      toUserId: args.toUserId,
      status: "pending",
      timestamp: Date.now(),
    });

    // Send email notification to recipient
    if (senderProfile && recipientProfile) {
      // Get recipient's email from auth system
      const recipientUser = await ctx.db.get(args.toUserId);
      if (recipientUser?.email) {
        await ctx.scheduler.runAfter(0, internal.emailActions.sendFriendRequestNotificationEmail, {
          email: recipientUser.email,
          recipientName: recipientProfile.displayName,
          senderName: senderProfile.displayName,
        });
      }
    }

    return requestId;
  },
});

export const acceptFriendRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const request = await ctx.db.get(args.requestId);
    if (!request || request.toUserId !== userId || request.status !== "pending") {
      throw new Error("Invalid request");
    }
    await ctx.db.patch(args.requestId, { status: "accepted" });
    await ctx.db.insert("friends", {
      user1Id: request.fromUserId,
      user2Id: request.toUserId,
      timestamp: Date.now(),
    });
    return "accepted";
  },
});

export const rejectFriendRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const request = await ctx.db.get(args.requestId);
    if (!request || request.toUserId !== userId || request.status !== "pending") {
      throw new Error("Invalid request");
    }
    await ctx.db.patch(args.requestId, { status: "rejected" });
    return "rejected";
  },
});

export const respondToFriendRequest = mutation({
  args: {
    requestId: v.id("friendRequests"),
    response: v.string(), // "accepted" or "rejected"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Friend request not found");

    if (request.toUserId !== userId) {
      throw new Error("Not authorized to respond to this request");
    }

    if (request.status !== "pending") {
      throw new Error("Request already responded to");
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: args.response,
    });

    // If accepted, create friendship
    if (args.response === "accepted") {
      await ctx.db.insert("friends", {
        user1Id: request.fromUserId,
        user2Id: request.toUserId,
        timestamp: Date.now(),
      });

      // Create a conversation for the new friends
      await ctx.db.insert("conversations", {
        participants: [request.fromUserId, request.toUserId],
        unreadCount: { user1: 0, user2: 0 },
      });
    }

    return args.response;
  },
});

export const getFriendRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Get sender profiles
    const requestsWithProfiles = await Promise.all(
      requests.map(async (request) => {
        const senderProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", request.fromUserId))
          .unique();

        const profileImageUrl = senderProfile?.profileImageId 
          ? await ctx.storage.getUrl(senderProfile.profileImageId)
          : null;

        return {
          ...request,
          fromUser: senderProfile ? {
            ...senderProfile,
            profileImageUrl,
          } : null,
        };
      })
    );

    return requestsWithProfiles;
  },
});

export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const friendships1 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .collect();

    const friendships2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .collect();

    const friendIds = [
      ...friendships1.map(f => f.user2Id),
      ...friendships2.map(f => f.user1Id),
    ];

    // Get friend profiles
    const friends = await Promise.all(
      friendIds.map(async (friendId) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", friendId))
          .unique();

        if (!profile) return null;

        const profileImageUrl = profile.profileImageId 
          ? await ctx.storage.getUrl(profile.profileImageId)
          : null;

        return {
          ...profile,
          profileImageUrl,
        };
      })
    );

    return friends.filter(Boolean);
  },
});

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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
      .withIndex("by_from", (q) => q.eq("fromUserId", userId))
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

    return await ctx.db.insert("friendRequests", {
      fromUserId: userId,
      toUserId: args.toUserId,
      status: "pending",
      timestamp: Date.now(),
    });
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
        type: "direct",
        isActive: true,
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
      .withIndex("by_to", (q) => q.eq("toUserId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Get sender profiles
    const requestsWithProfiles = await Promise.all(
      requests.map(async (request) => {
        const senderProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", request.fromUserId))
          .unique();

        const profileImageUrl = senderProfile?.profileImage 
          ? await ctx.storage.getUrl(senderProfile.profileImage)
          : null;

        return {
          ...request,
          senderProfile: senderProfile ? {
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

        const profileImageUrl = profile.profileImage 
          ? await ctx.storage.getUrl(profile.profileImage)
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

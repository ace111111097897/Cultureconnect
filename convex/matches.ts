import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const createMatch = mutation({
  args: {
    targetUserId: v.id("users"),
    interactionType: v.string(), // "like", "pass"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Record the interaction
    await ctx.db.insert("userInteractions", {
      userId,
      targetUserId: args.targetUserId,
      interactionType: args.interactionType,
      timestamp: Date.now(),
    });

    if (args.interactionType === "like") {
      // Check if the other user already liked this user
      const reciprocalLike = await ctx.db
        .query("userInteractions")
        .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
        .filter((q) => q.eq(q.field("targetUserId"), userId))
        .filter((q) => q.eq(q.field("interactionType"), "like"))
        .first();

      if (reciprocalLike) {
        // Create mutual match
        const userProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .unique();

        const targetProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
          .unique();

        if (userProfile && targetProfile) {
          // Calculate compatibility and shared interests
          const compatibilityScore = calculateDetailedCompatibility(userProfile, targetProfile);
          const sharedInterests = findSharedInterests(userProfile, targetProfile);

          const matchId = await ctx.db.insert("matches", {
            user1Id: userId,
            user2Id: args.targetUserId,
            compatibilityScore,
            sharedInterests,
            matchType: "cultural",
            status: "mutual",
            timestamp: Date.now(),
          });

          // Create conversation for the match
          await ctx.db.insert("conversations", {
            participants: [userId, args.targetUserId],
            type: "direct",
            isActive: true,
          });

          // Match created successfully

          return { matched: true, matchId };
        }
      }
    }

    return { matched: false };
  },
});

export const getUserMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const matches = await ctx.db
      .query("matches")
      .filter((q) => 
        q.or(
          q.eq(q.field("user1Id"), userId),
          q.eq(q.field("user2Id"), userId)
        )
      )
      .filter((q) => q.eq(q.field("status"), "mutual"))
      .collect();

    // Get profile details for each match
    const matchesWithProfiles = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
        const otherProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", otherUserId))
          .unique();

        if (!otherProfile) return null;

        const profileImageUrl = otherProfile.profileImage 
          ? await ctx.storage.getUrl(otherProfile.profileImage)
          : null;

        const profileVideoUrl = otherProfile.profileVideo
          ? await ctx.storage.getUrl(otherProfile.profileVideo)
          : null;

        return {
          ...match,
          otherProfile: {
            ...otherProfile,
            profileImageUrl,
            profileVideoUrl,
          },
        };
      })
    );

    return matchesWithProfiles.filter(Boolean);
  },
});

// NEW: Get friends of friends for discovery
export const getFriendsOfFriends = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get user's friends
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

    // Get friends of friends
    const friendsOfFriends = new Set<string>();
    
    for (const friendId of friendIds) {
      const friendFriendships1 = await ctx.db
        .query("friends")
        .withIndex("by_user1", (q) => q.eq("user1Id", friendId))
        .collect();

      const friendFriendships2 = await ctx.db
        .query("friends")
        .withIndex("by_user2", (q) => q.eq("user2Id", friendId))
        .collect();

      const friendOfFriendIds = [
        ...friendFriendships1.map(f => f.user2Id),
        ...friendFriendships2.map(f => f.user1Id),
      ];

      // Add friends of friends, excluding the original user and their direct friends
      for (const fofId of friendOfFriendIds) {
        if (fofId !== userId && !friendIds.includes(fofId)) {
          friendsOfFriends.add(fofId);
        }
      }
    }

    // Get profiles for friends of friends
    const friendsOfFriendsProfiles = await Promise.all(
      Array.from(friendsOfFriends).slice(0, args.limit || 10).map(async (fofId) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", fofId as Id<'users'>))
          .unique();

        if (!profile) return null;

        const profileImageUrl = profile.profileImage 
          ? await ctx.storage.getUrl(profile.profileImage)
          : null;

        const profileVideoUrl = profile.profileVideo
          ? await ctx.storage.getUrl(profile.profileVideo)
          : null;

        return {
          ...profile,
          profileImageUrl,
          profileVideoUrl,
          isFriendOfFriend: true,
        };
      })
    );

    return friendsOfFriendsProfiles.filter(Boolean);
  },
});

function calculateDetailedCompatibility(profile1: any, profile2: any): number {
  let score = 0;
  let weights = 0;

  // Cultural background (25%)
  const culturalMatch = profile1.culturalBackground.filter((bg: string) => 
    profile2.culturalBackground.includes(bg)
  ).length;
  score += (culturalMatch / Math.max(profile1.culturalBackground.length, profile2.culturalBackground.length, 1)) * 25;
  weights += 25;

  // Values (30%)
  const valuesMatch = profile1.values.filter((value: string) => 
    profile2.values.includes(value)
  ).length;
  score += (valuesMatch / Math.max(profile1.values.length, profile2.values.length, 1)) * 30;
  weights += 30;

  // Languages (15%)
  const languageMatch = profile1.languages.filter((lang: string) => 
    profile2.languages.includes(lang)
  ).length;
  score += (languageMatch / Math.max(profile1.languages.length, profile2.languages.length, 1)) * 15;
  weights += 15;

  // Life goals (20%)
  const goalsMatch = profile1.lifeGoals.filter((goal: string) => 
    profile2.lifeGoals.includes(goal)
  ).length;
  score += (goalsMatch / Math.max(profile1.lifeGoals.length, profile2.lifeGoals.length, 1)) * 20;
  weights += 20;

  // Interests (10%)
  const interestsMatch = [
    ...profile1.foodPreferences.filter((food: string) => profile2.foodPreferences.includes(food)),
    ...profile1.musicGenres.filter((genre: string) => profile2.musicGenres.includes(genre)),
    ...profile1.travelInterests.filter((travel: string) => profile2.travelInterests.includes(travel)),
  ].length;
  
  const totalInterests = profile1.foodPreferences.length + profile1.musicGenres.length + profile1.travelInterests.length +
                        profile2.foodPreferences.length + profile2.musicGenres.length + profile2.travelInterests.length;
  
  score += (interestsMatch / Math.max(totalInterests / 2, 1)) * 10;
  weights += 10;

  return Math.round(score);
}

function findSharedInterests(profile1: any, profile2: any): string[] {
  const shared = [
    ...profile1.culturalBackground.filter((bg: string) => profile2.culturalBackground.includes(bg)),
    ...profile1.languages.filter((lang: string) => profile2.languages.includes(lang)),
    ...profile1.values.filter((value: string) => profile2.values.includes(value)),
    ...profile1.foodPreferences.filter((food: string) => profile2.foodPreferences.includes(food)),
    ...profile1.musicGenres.filter((genre: string) => profile2.musicGenres.includes(genre)),
    ...profile1.travelInterests.filter((travel: string) => profile2.travelInterests.includes(travel)),
  ];

  return [...new Set(shared)];
}

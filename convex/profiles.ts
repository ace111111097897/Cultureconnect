import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const upsertProfile = mutation({
  args: {
    displayName: v.string(),
    age: v.float64(),
    bio: v.string(),
    location: v.string(),
    languages: v.array(v.string()),
    culturalBackground: v.array(v.string()),
    traditions: v.array(v.string()),
    foodPreferences: v.array(v.string()),
    musicGenres: v.array(v.string()),
    travelInterests: v.array(v.string()),
    lifeGoals: v.array(v.string()),
    values: v.array(v.string()),
    relationshipGoals: v.string(),
    zodiacSign: v.string(),
    ageRangeMin: v.float64(),
    ageRangeMax: v.float64(),
    maxDistance: v.float64(),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const profileData = {
      userId,
      displayName: args.displayName,
      age: args.age,
      bio: args.bio,
      location: args.location,
      languages: args.languages,
      culturalBackground: args.culturalBackground,
      traditions: args.traditions,
      foodPreferences: args.foodPreferences,
      musicGenres: args.musicGenres,
      travelInterests: args.travelInterests,
      lifeGoals: args.lifeGoals,
      values: args.values,
      relationshipGoals: args.relationshipGoals,
      zodiacSign: args.zodiacSign,
      ageRangeMin: args.ageRangeMin,
      ageRangeMax: args.ageRangeMax,
      maxDistance: args.maxDistance,

      isActive: true,
      lastActive: Date.now(),
    };

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
      return existingProfile._id;
    } else {
      const newProfileId = await ctx.db.insert("profiles", profileData);
      return newProfileId;
    }
  },
});

export const getCurrentUserProfile = query({
  args: {},
  returns: v.union(v.null(), v.any()),
  handler: async (ctx) => {
    let userId = await getAuthUserId(ctx);
    
    // If no authenticated user, try to get the first user as fallback
    if (!userId) {
      const firstUser = await ctx.db.query("users").first();
      if (firstUser) {
        userId = firstUser._id;
      } else {
        return null;
      }
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
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
    };
  },
});



export const getDiscoverProfiles = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const userProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!userProfile) return [];

    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.neq(q.field("userId"), userId))
      .take(args.limit || 10);

    const profilesWithImages = await Promise.all(
      profiles.map(async (profile) => {
        const profileImageUrl = profile.profileImage 
          ? await ctx.storage.getUrl(profile.profileImage)
          : null;

        const profileVideoUrl = profile.profileVideo
          ? await ctx.storage.getUrl(profile.profileVideo)
          : null;

        // Calculate compatibility score based on shared interests
        const sharedCulture = profile.culturalBackground.filter(bg => 
          userProfile.culturalBackground.includes(bg)
        ).length;
        const sharedValues = profile.values.filter(value => 
          userProfile.values.includes(value)
        ).length;
        const sharedInterests = [
          ...profile.foodPreferences.filter(food => userProfile.foodPreferences.includes(food)),
          ...profile.musicGenres.filter(music => userProfile.musicGenres.includes(music)),
          ...profile.travelInterests.filter(travel => userProfile.travelInterests.includes(travel)),
        ].length;

        const totalPossibleMatches = Math.max(
          userProfile.culturalBackground.length + userProfile.values.length + 
          userProfile.foodPreferences.length + userProfile.musicGenres.length + 
          userProfile.travelInterests.length, 1
        );

        const compatibilityScore = Math.round(
          ((sharedCulture * 2 + sharedValues * 2 + sharedInterests) / totalPossibleMatches) * 100
        );

        return {
          ...profile,
          profileImageUrl,
          profileVideoUrl,
          compatibilityScore,
        };
      })
    );

    return profilesWithImages.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateProfileImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      profileImage: args.storageId,
    });
  },
});

export const updateProfileVideo = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      profileVideo: args.storageId,
    });
  },
});

export const getProfileById = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
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
    };
  },
});

// Add some test friends and matches for development
export const createTestData = mutation({
  args: {},
  handler: async (ctx) => {
    let userId = await getAuthUserId(ctx);
    
    // If no authenticated user, try to get the first user as fallback
    if (!userId) {
      const firstUser = await ctx.db.query("users").first();
      if (firstUser) {
        userId = firstUser._id;
      } else {
        throw new Error("No users found");
      }
    }

    // Get all other users
    const allUsers = await ctx.db.query("users").collect();
    const otherUsers = allUsers.filter(u => u._id !== userId).slice(0, 3);

    if (otherUsers.length === 0) {
      throw new Error("No other users found to create test data");
    }

    const results = [];

    // Create some friendships
    for (const otherUser of otherUsers.slice(0, 2)) {
      try {
        // Check if friendship already exists
        const existingFriendship1 = await ctx.db
          .query("friends")
          .withIndex("by_user1", (q) => q.eq("user1Id", userId))
          .filter((q) => q.eq(q.field("user2Id"), otherUser._id))
          .unique();

        const existingFriendship2 = await ctx.db
          .query("friends")
          .withIndex("by_user2", (q) => q.eq("user2Id", userId))
          .filter((q) => q.eq(q.field("user1Id"), otherUser._id))
          .unique();

        if (!existingFriendship1 && !existingFriendship2) {
          await ctx.db.insert("friends", {
            user1Id: userId,
            user2Id: otherUser._id,
            timestamp: Date.now(),
          });

          // Create conversation for the friendship
          await ctx.db.insert("conversations", {
            participants: [userId, otherUser._id],
            type: "direct",
            isActive: true,
            lastMessageTime: Date.now(),
          });

          results.push(`Created friendship with ${otherUser._id}`);
        }
      } catch (error) {
        console.error("Error creating friendship:", error);
      }
    }

    // Create some matches
    for (const otherUser of otherUsers.slice(1, 3)) {
      try {
        // Check if match already exists
        const existingMatch = await ctx.db
          .query("matches")
          .filter((q) => 
            q.or(
              q.and(q.eq(q.field("user1Id"), userId), q.eq(q.field("user2Id"), otherUser._id)),
              q.and(q.eq(q.field("user1Id"), otherUser._id), q.eq(q.field("user2Id"), userId))
            )
          )
          .unique();

        if (!existingMatch) {
          await ctx.db.insert("matches", {
            user1Id: userId,
            user2Id: otherUser._id,
            compatibilityScore: 85,
            sharedInterests: ["Music", "Travel"],
            matchType: "cultural",
            status: "mutual",
            timestamp: Date.now(),
          });

          results.push(`Created match with ${otherUser._id}`);
        }
      } catch (error) {
        console.error("Error creating match:", error);
      }
    }

    return { success: true, results };
  },
});

// Calculate match percentage between two users
export const calculateMatchPercentage = query({
  args: {
    targetUserId: v.id("users"),
  },
  returns: v.object({
    matchPercentage: v.number(),
    sharedInterests: v.array(v.string()),
    culturalCompatibility: v.number(),
    interestOverlap: v.number(),
    detailedBreakdown: v.object({
      languages: v.number(),
      culturalBackground: v.number(),
      traditions: v.number(),
      foodPreferences: v.number(),
      musicGenres: v.number(),
      travelInterests: v.number(),
      lifeGoals: v.number(),
      values: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!currentUser) {
      throw new Error("Current user not found");
    }

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .first();

    const targetProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .first();

    if (!currentProfile || !targetProfile) {
      return {
        matchPercentage: 0,
        sharedInterests: [],
        culturalCompatibility: 0,
        interestOverlap: 0,
        detailedBreakdown: {
          languages: 0,
          culturalBackground: 0,
          traditions: 0,
          foodPreferences: 0,
          musicGenres: 0,
          travelInterests: 0,
          lifeGoals: 0,
          values: 0,
        },
      };
    }

    // Calculate overlap for each category
    const calculateOverlap = (arr1: string[], arr2: string[]) => {
      if (arr1.length === 0 && arr2.length === 0) return 1;
      if (arr1.length === 0 || arr2.length === 0) return 0;
      
      const set1 = new Set(arr1.map(item => item.toLowerCase()));
      const set2 = new Set(arr2.map(item => item.toLowerCase()));
      const intersection = new Set([...set1].filter(x => set2.has(x)));
      const union = new Set([...set1, ...set2]);
      
      return union.size > 0 ? intersection.size / union.size : 0;
    };

    const detailedBreakdown = {
      languages: calculateOverlap(currentProfile.languages, targetProfile.languages),
      culturalBackground: calculateOverlap(currentProfile.culturalBackground, targetProfile.culturalBackground),
      traditions: calculateOverlap(currentProfile.traditions, targetProfile.traditions),
      foodPreferences: calculateOverlap(currentProfile.foodPreferences, targetProfile.foodPreferences),
      musicGenres: calculateOverlap(currentProfile.musicGenres, targetProfile.musicGenres),
      travelInterests: calculateOverlap(currentProfile.travelInterests, targetProfile.travelInterests),
      lifeGoals: calculateOverlap(currentProfile.lifeGoals, targetProfile.lifeGoals),
      values: calculateOverlap(currentProfile.values, targetProfile.values),
    };

    // Calculate weighted scores
    const weights = {
      languages: 0.15,
      culturalBackground: 0.20,
      traditions: 0.15,
      foodPreferences: 0.10,
      musicGenres: 0.10,
      travelInterests: 0.10,
      lifeGoals: 0.10,
      values: 0.10,
    };

    const culturalCompatibility = Object.entries(detailedBreakdown).reduce(
      (total, [key, score]) => total + (score * weights[key as keyof typeof weights]),
      0
    );

    // Find shared interests
    const allInterests = [
      ...currentProfile.languages,
      ...currentProfile.culturalBackground,
      ...currentProfile.traditions,
      ...currentProfile.foodPreferences,
      ...currentProfile.musicGenres,
      ...currentProfile.travelInterests,
      ...currentProfile.lifeGoals,
      ...currentProfile.values,
    ];

    const targetInterests = [
      ...targetProfile.languages,
      ...targetProfile.culturalBackground,
      ...targetProfile.traditions,
      ...targetProfile.foodPreferences,
      ...targetProfile.musicGenres,
      ...targetProfile.travelInterests,
      ...targetProfile.lifeGoals,
      ...targetProfile.values,
    ];

    const sharedInterests = allInterests.filter(interest => 
      targetInterests.some(targetInterest => 
        targetInterest.toLowerCase() === interest.toLowerCase()
      )
    );

    // Remove duplicates and limit to top 5
    const uniqueSharedInterests = [...new Set(sharedInterests)].slice(0, 5);

    // Calculate overall match percentage
    const matchPercentage = Math.round(culturalCompatibility * 100);

    return {
      matchPercentage,
      sharedInterests: uniqueSharedInterests,
      culturalCompatibility,
      interestOverlap: culturalCompatibility,
      detailedBreakdown,
    };
  },
});

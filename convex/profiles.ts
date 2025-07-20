import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const upsertProfile = mutation({
  args: {
    displayName: v.string(),
    age: v.number(),
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
    ageRangeMin: v.number(),
    ageRangeMax: v.number(),
    maxDistance: v.number(),
    socialLinks: v.optional(v.object({
      instagram: v.optional(v.string()),
      twitter: v.optional(v.string()),
      facebook: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
    })),
  },
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
      socialLinks: args.socialLinks,
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

// Initialize demo data for testing
export const initializeDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if there's already data
    const existingUser = await ctx.db.query("users").first();
    if (existingUser) {
      return { message: "Demo data already exists" };
    }
    
    // Create a demo user
    const userId = await ctx.db.insert("users", {
      createdAt: Date.now(),
      displayName: "Demo User",
      email: "demo@example.com",
      lastActive: Date.now(),
      isAnonymous: false,
    });
    
    // Create a demo profile
    await ctx.db.insert("profiles", {
      userId,
      displayName: "Demo User",
      age: 25,
      bio: "I love exploring different cultures and meeting new people!",
      location: "New York, NY",
      languages: ["English", "Spanish"],
      culturalBackground: ["Mixed Heritage"],
      traditions: ["Family gatherings", "Cultural festivals"],
      foodPreferences: ["Mediterranean", "Asian", "Latin American"],
      musicGenres: ["Pop", "Jazz", "World Music"],
      travelInterests: ["Cultural immersion", "Food tours"],
      lifeGoals: ["Travel the world", "Learn new languages"],
      values: ["Family first", "Cultural preservation"],
      relationshipGoals: "Long-term partnership",
      zodiacSign: "Libra",
      ageRangeMin: 20,
      ageRangeMax: 35,
      maxDistance: 50,
      isActive: true,
      lastActive: Date.now(),
    });
    
    // Create demo friends and matches
    await createDemoFriendsAndMatches(ctx, userId);
    
    return { message: "Demo data created successfully" };
  },
});

// Helper function to create demo friends and matches
async function createDemoFriendsAndMatches(ctx: any, mainUserId: any) {
  // Create demo users for friends and matches
  const demoUsers = [
    {
      displayName: "babyf",
      age: 23,
      bio: "Love traveling and trying new foods!",
      location: "Los Angeles, CA",
      languages: ["English", "French"],
      culturalBackground: ["European"],
      traditions: ["Traditional Cooking", "Music & Dance"],
      foodPreferences: ["French", "Italian", "Mediterranean"],
      musicGenres: ["Jazz", "Classical", "Pop"],
      travelInterests: ["Cultural Heritage Sites", "Food Tours"],
      lifeGoals: ["Career Growth", "Travel the world"],
      values: ["Creativity", "Adventure"],
      relationshipGoals: "Long-term partnership",
      zodiacSign: "Gemini",
    },
    {
      displayName: "Bruce Wayne",
      age: 28,
      bio: "Entrepreneur by day, adventurer by night.",
      location: "Gotham City",
      languages: ["English", "Latin"],
      culturalBackground: ["European", "American"],
      traditions: ["Family Gatherings", "Traditional Medicine"],
      foodPreferences: ["American", "Italian", "Asian"],
      musicGenres: ["Classical", "Jazz", "Rock"],
      travelInterests: ["Historical Sites", "Adventure Sports"],
      lifeGoals: ["Career Growth", "Community Service"],
      values: ["Justice", "Family"],
      relationshipGoals: "Marriage",
      zodiacSign: "Capricorn",
    },
    {
      displayName: "sibby",
      age: 26,
      bio: "Passionate about cultural exchange and learning!",
      location: "San Francisco, CA",
      languages: ["English", "Spanish", "Japanese"],
      culturalBackground: ["Asian", "Latin American"],
      traditions: ["Tea Ceremony", "Cultural Festivals"],
      foodPreferences: ["Japanese", "Mexican", "Thai"],
      musicGenres: ["J-Pop", "Folk", "Electronic"],
      travelInterests: ["Cultural immersion", "Music festivals"],
      lifeGoals: ["Language Learning", "Cultural Exchange"],
      values: ["Diversity", "Education"],
      relationshipGoals: "Cultural exchange",
      zodiacSign: "Aquarius",
    },
    {
      displayName: "マシュー",
      age: 24,
      bio: "Japanese-American who loves connecting cultures!",
      location: "Tokyo, Japan",
      languages: ["Japanese", "English"],
      culturalBackground: ["Asian", "American"],
      traditions: ["Tea Ceremony", "Cherry Blossom Viewing"],
      foodPreferences: ["Japanese", "Korean", "Thai"],
      musicGenres: ["J-Pop", "K-Pop", "Traditional"],
      travelInterests: ["Cultural Heritage Sites", "Food Tours"],
      lifeGoals: ["Cultural Exchange", "Language Learning"],
      values: ["Tradition", "Innovation"],
      relationshipGoals: "Long-term partnership",
      zodiacSign: "Cancer",
    }
  ];

  for (const demoUser of demoUsers) {
    // Create user
    const userId = await ctx.db.insert("users", {
      createdAt: Date.now(),
      displayName: demoUser.displayName,
      email: `${demoUser.displayName.toLowerCase()}@example.com`,
      lastActive: Date.now(),
      isAnonymous: false,
    });

    // Create profile
    await ctx.db.insert("profiles", {
      userId,
      ...demoUser,
      ageRangeMin: 20,
      ageRangeMax: 35,
      maxDistance: 50,
      isActive: true,
      lastActive: Date.now(),
    });

    // Create friendship (for first 3 users)
    if (demoUser.displayName !== "マシュー") {
      await ctx.db.insert("friends", {
        user1Id: mainUserId,
        user2Id: userId,
        timestamp: Date.now(),
      });
    }

    // Create match (for マシュー)
    if (demoUser.displayName === "マシュー") {
      await ctx.db.insert("matches", {
        user1Id: mainUserId,
        user2Id: userId,
        compatibilityScore: 85,
        sharedInterests: ["Cultural Exchange", "Language Learning", "Food Tours"],
        matchType: "cultural",
        status: "mutual",
        timestamp: Date.now(),
      });
    }
  }
}

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
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateProfileImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
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

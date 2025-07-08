import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return null;

    // Get profile image URL if exists
    const profileImageUrl = profile.profileImage 
      ? await ctx.storage.getUrl(profile.profileImage)
      : null;

    return {
      ...profile,
      profileImageUrl,
    };
  },
});

export const createProfile = mutation({
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
    ageRangeMin: v.number(),
    ageRangeMax: v.number(),
    maxDistance: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    return await ctx.db.insert("profiles", {
      userId,
      ...args,
      isActive: true,
      lastActive: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    languages: v.optional(v.array(v.string())),
    culturalBackground: v.optional(v.array(v.string())),
    traditions: v.optional(v.array(v.string())),
    foodPreferences: v.optional(v.array(v.string())),
    musicGenres: v.optional(v.array(v.string())),
    travelInterests: v.optional(v.array(v.string())),
    lifeGoals: v.optional(v.array(v.string())),
    values: v.optional(v.array(v.string())),
    relationshipGoals: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const updates = Object.fromEntries(
      Object.entries(args).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(profile._id, {
      ...updates,
      lastActive: Date.now(),
    });
  },
});

export const getDiscoverProfiles = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!currentProfile) return [];

    // Get profiles excluding current user and already interacted users
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.neq(q.field("userId"), userId))
      .take(args.limit || 10);

    // Get profile images and calculate compatibility scores
    const profilesWithDetails = await Promise.all(
      profiles.map(async (profile) => {
        const profileImageUrl = profile.profileImage 
          ? await ctx.storage.getUrl(profile.profileImage)
          : null;

        // Calculate basic compatibility score
        const compatibilityScore = calculateCompatibility(currentProfile, profile);

        return {
          ...profile,
          profileImageUrl,
          compatibilityScore,
        };
      })
    );

    // Sort by compatibility score
    return profilesWithDetails.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  },
});

function calculateCompatibility(profile1: any, profile2: any): number {
  let score = 0;
  let totalFactors = 0;

  // Cultural background match
  const culturalMatch = profile1.culturalBackground.filter((bg: string) => 
    profile2.culturalBackground.includes(bg)
  ).length;
  score += (culturalMatch / Math.max(profile1.culturalBackground.length, 1)) * 20;
  totalFactors += 20;

  // Language match
  const languageMatch = profile1.languages.filter((lang: string) => 
    profile2.languages.includes(lang)
  ).length;
  score += (languageMatch / Math.max(profile1.languages.length, 1)) * 15;
  totalFactors += 15;

  // Values match
  const valuesMatch = profile1.values.filter((value: string) => 
    profile2.values.includes(value)
  ).length;
  score += (valuesMatch / Math.max(profile1.values.length, 1)) * 25;
  totalFactors += 25;

  // Food preferences match
  const foodMatch = profile1.foodPreferences.filter((food: string) => 
    profile2.foodPreferences.includes(food)
  ).length;
  score += (foodMatch / Math.max(profile1.foodPreferences.length, 1)) * 10;
  totalFactors += 10;

  // Music match
  const musicMatch = profile1.musicGenres.filter((genre: string) => 
    profile2.musicGenres.includes(genre)
  ).length;
  score += (musicMatch / Math.max(profile1.musicGenres.length, 1)) * 10;
  totalFactors += 10;

  // Age compatibility
  const ageDiff = Math.abs(profile1.age - profile2.age);
  const ageScore = Math.max(0, 20 - ageDiff * 2);
  score += ageScore;
  totalFactors += 20;

  return Math.round((score / totalFactors) * 100);
}

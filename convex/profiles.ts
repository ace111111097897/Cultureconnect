import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

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
    let profileImageUrl = null;
    if (profile.profileImageId) {
      profileImageUrl = await ctx.storage.getUrl(profile.profileImageId);
    }

    return {
      ...profile,
      profileImageUrl,
    };
  },
});

export const upsertProfile = mutation({
  args: {
    displayName: v.string(),
    age: v.number(),
    bio: v.string(),
    location: v.string(),
    email: v.optional(v.string()),
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

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const profileData = {
      userId,
      ...args,
    };

    let profileId;
    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
      profileId = existingProfile._id;
    } else {
      profileId = await ctx.db.insert("profiles", profileData);
      
      // Send welcome email for new profiles
      if (args.email) {
        await ctx.scheduler.runAfter(0, internal.emailActions.sendWelcomeEmail, {
          email: args.email,
          displayName: args.displayName,
        });
      }
    }

    return profileId;
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
      profileImageId: args.storageId,
    });

    return { success: true };
  },
});

export const getDiscoverProfiles = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const currentUserProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!currentUserProfile) return [];

    // Get all profiles except current user
    const allProfiles = await ctx.db
      .query("profiles")
      .filter((q) => q.neq(q.field("userId"), userId))
      .take(args.limit * 2); // Get more to filter and calculate compatibility

    // Calculate compatibility scores and add profile images
    const profilesWithCompatibility = await Promise.all(
      allProfiles.map(async (profile) => {
        const compatibilityScore = calculateCompatibility(currentUserProfile, profile);
        
        let profileImageUrl = null;
        if (profile.profileImageId) {
          profileImageUrl = await ctx.storage.getUrl(profile.profileImageId);
        }

        return {
          ...profile,
          compatibilityScore,
          profileImageUrl,
        };
      })
    );

    // Sort by compatibility score and return top matches
    return profilesWithCompatibility
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, args.limit);
  },
});

export const getUserProfileById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (!profile) return null;
    let profileImageUrl = null;
    if (profile.profileImageId) {
      profileImageUrl = await ctx.storage.getUrl(profile.profileImageId);
    }
    return { ...profile, profileImageUrl };
  },
});

function calculateCompatibility(user1: any, user2: any): number {
  let score = 0;
  let totalFactors = 0;

  // Age compatibility (within 10 years = 20 points)
  const ageDiff = Math.abs(user1.age - user2.age);
  if (ageDiff <= 5) score += 20;
  else if (ageDiff <= 10) score += 15;
  else if (ageDiff <= 15) score += 10;
  totalFactors += 20;

  // Cultural background overlap
  const culturalOverlap = user1.culturalBackground.filter((bg: string) =>
    user2.culturalBackground.includes(bg)
  ).length;
  score += Math.min(culturalOverlap * 10, 20);
  totalFactors += 20;

  // Language overlap
  const languageOverlap = user1.languages.filter((lang: string) =>
    user2.languages.includes(lang)
  ).length;
  score += Math.min(languageOverlap * 8, 16);
  totalFactors += 16;

  // Values overlap
  const valuesOverlap = user1.values.filter((value: string) =>
    user2.values.includes(value)
  ).length;
  score += Math.min(valuesOverlap * 6, 18);
  totalFactors += 18;

  // Food preferences overlap
  const foodOverlap = user1.foodPreferences.filter((food: string) =>
    user2.foodPreferences.includes(food)
  ).length;
  score += Math.min(foodOverlap * 4, 12);
  totalFactors += 12;

  // Life goals overlap
  const goalsOverlap = user1.lifeGoals.filter((goal: string) =>
    user2.lifeGoals.includes(goal)
  ).length;
  score += Math.min(goalsOverlap * 3, 12);
  totalFactors += 12;

  // Normalize to percentage
  return Math.round((score / totalFactors) * 100);
}

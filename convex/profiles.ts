import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

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
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

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
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

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
  args: {
    profileId: v.id("profiles"),
  },
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

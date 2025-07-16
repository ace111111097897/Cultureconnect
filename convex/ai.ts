import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const getKandiUserData = action({
  args: {
    targetUserId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    currentUser: any;
    targetUser: any;
    availableUsers: any[];
  }> => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Get current user's profile
    const currentUserProfile: any = await ctx.runQuery(api.profiles.getCurrentUserProfile);
    
    if (!currentUserProfile) {
      return {
        currentUser: null,
        targetUser: null,
        availableUsers: []
      };
    }

    // If a specific user is requested, get their profile
    let targetUserProfile: any = null;
    if (args.targetUserId && args.targetUserId !== currentUserId) {
      // For now, we'll get discoverable profiles and find the target
      const discoverProfiles: any[] = await ctx.runQuery(api.profiles.getDiscoverProfiles, { limit: 50 });
      targetUserProfile = discoverProfiles.find((p: any) => p.userId === args.targetUserId) || null;
    }

    // Get available users for context (limited to protect privacy)
    const availableUsers: any[] = await ctx.runQuery(api.profiles.getDiscoverProfiles, { limit: 10 });

    return {
      currentUser: {
        displayName: currentUserProfile.displayName,
        age: currentUserProfile.age,
        bio: currentUserProfile.bio,
        location: currentUserProfile.location,
        languages: currentUserProfile.languages,
        culturalBackground: currentUserProfile.culturalBackground,
        traditions: currentUserProfile.traditions,
        foodPreferences: currentUserProfile.foodPreferences,
        musicGenres: currentUserProfile.musicGenres,
        travelInterests: currentUserProfile.travelInterests,
        lifeGoals: currentUserProfile.lifeGoals,
        values: currentUserProfile.values,
        relationshipGoals: currentUserProfile.relationshipGoals
      },
      targetUser: targetUserProfile ? {
        displayName: targetUserProfile.displayName,
        age: targetUserProfile.age,
        bio: targetUserProfile.bio,
        location: targetUserProfile.location,
        languages: targetUserProfile.languages,
        culturalBackground: targetUserProfile.culturalBackground,
        traditions: targetUserProfile.traditions,
        foodPreferences: targetUserProfile.foodPreferences,
        musicGenres: targetUserProfile.musicGenres,
        travelInterests: targetUserProfile.travelInterests,
        lifeGoals: targetUserProfile.lifeGoals,
        values: targetUserProfile.values,
        relationshipGoals: targetUserProfile.relationshipGoals,
        compatibilityScore: targetUserProfile.compatibilityScore
      } : null,
      availableUsers: availableUsers.map((user: any) => ({
        displayName: user.displayName,
        age: user.age,
        location: user.location,
        culturalBackground: user.culturalBackground,
        compatibilityScore: user.compatibilityScore
      }))
    };
  },
}); 
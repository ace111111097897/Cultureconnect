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
    culturalInsights: any;
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
        availableUsers: [],
        culturalInsights: null
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

    // Generate cultural insights and conversation topics
    const culturalInsights = generateCulturalInsights(currentUserProfile, targetUserProfile);

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
      })),
      culturalInsights
    };
  },
});

// Helper function to generate cultural insights and conversation topics
function generateCulturalInsights(currentUser: any, targetUser: any) {
  if (!currentUser || !targetUser) {
    return {
      sharedInterests: [],
      conversationTopics: [],
      culturalConnections: [],
      icebreakers: []
    };
  }

  // Find shared interests
  const sharedInterests = [
    ...currentUser.foodPreferences.filter((food: string) => targetUser.foodPreferences.includes(food)),
    ...currentUser.musicGenres.filter((music: string) => targetUser.musicGenres.includes(music)),
    ...currentUser.travelInterests.filter((travel: string) => targetUser.travelInterests.includes(travel)),
    ...currentUser.values.filter((value: string) => targetUser.values.includes(value))
  ];

  // Generate conversation topics based on profiles
  const conversationTopics = [
    `Ask about ${targetUser.displayName}'s cultural background: ${targetUser.culturalBackground.join(', ')}`,
    `Discuss shared interest in ${sharedInterests.length > 0 ? sharedInterests[0] : 'cultural exchange'}`,
    `Explore ${targetUser.displayName}'s traditions: ${targetUser.traditions.join(', ')}`,
    `Talk about travel experiences, especially ${targetUser.travelInterests.join(', ')}`,
    `Share music recommendations from ${targetUser.musicGenres.join(', ')} genres`,
    `Discuss food culture and ${targetUser.foodPreferences.join(', ')} preferences`
  ];

  // Cultural connections
  const culturalConnections = [
    `Both interested in ${sharedInterests.length > 0 ? sharedInterests.join(', ') : 'cultural learning'}`,
    `Shared values: ${currentUser.values.filter((v: string) => targetUser.values.includes(v)).join(', ')}`,
    `Language connection: ${currentUser.languages.filter((l: string) => targetUser.languages.includes(l)).join(', ')}`,
    `Cultural exchange potential between ${currentUser.culturalBackground.join(', ')} and ${targetUser.culturalBackground.join(', ')}`
  ];

  // Icebreakers
  const icebreakers = [
    `"What's your favorite cultural tradition and why?"`,
    `"If you could travel anywhere to experience a different culture, where would you go?"`,
    `"What's a dish from your culture that you'd love to share with others?"`,
    `"What's a cultural celebration that's meaningful to you?"`,
    `"How do you like to celebrate your cultural heritage?"`,
    `"What's something about your culture that you think others should know?"`
  ];

  return {
    sharedInterests,
    conversationTopics,
    culturalConnections,
    icebreakers
  };
} 
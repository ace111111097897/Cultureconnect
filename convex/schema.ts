import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    age: v.number(),
    bio: v.string(),
    profileImage: v.optional(v.id("_storage")),
    profileVideo: v.optional(v.id("_storage")),
    location: v.string(),
    
    // Social Media Links
    socialLinks: v.optional(v.object({
      instagram: v.optional(v.string()),
      twitter: v.optional(v.string()),
      facebook: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
    })),
    
    // Cultural Information
    languages: v.array(v.string()),
    culturalBackground: v.array(v.string()),
    traditions: v.array(v.string()),
    foodPreferences: v.array(v.string()),
    musicGenres: v.array(v.string()),
    travelInterests: v.array(v.string()),
    
    // Values & Goals
    lifeGoals: v.array(v.string()),
    values: v.array(v.string()),
    relationshipGoals: v.string(),
    
    // Preferences
    ageRangeMin: v.number(),
    ageRangeMax: v.number(),
    maxDistance: v.number(),
    
    isActive: v.boolean(),
    lastActive: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_active", ["isActive"])
    .index("by_location", ["location"]),

  culturalPrompts: defineTable({
    question: v.string(),
    category: v.string(), // "traditions", "food", "travel", "values", etc.
    options: v.array(v.string()),
    isActive: v.boolean(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  promptResponses: defineTable({
    userId: v.id("users"),
    promptId: v.id("culturalPrompts"),
    response: v.string(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_prompt", ["promptId"]),

  matches: defineTable({
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    compatibilityScore: v.number(),
    sharedInterests: v.array(v.string()),
    matchType: v.string(), // "cultural", "values", "interests"
    status: v.string(), // "pending", "mutual", "declined"
    timestamp: v.number(),
  })
    .index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"])
    .index("by_status", ["status"]),

  // NEW: Friend system
  friendRequests: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    status: v.string(), // "pending", "accepted", "rejected"
    timestamp: v.number(),
  })
    .index("by_from", ["fromUserId"])
    .index("by_to", ["toUserId"])
    .index("by_status", ["status"]),

  friends: defineTable({
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    timestamp: v.number(),
  })
    .index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    type: v.string(), // "direct", "group"
    title: v.optional(v.string()),
    culturalTheme: v.optional(v.string()),
    lastMessage: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_participants", ["participants"])
    .index("by_type", ["type"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    messageType: v.string(), // "text", "story", "cultural_moment"
    timestamp: v.number(),
    isRead: v.boolean(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"])
    .index("by_timestamp", ["timestamp"]),

  culturalStories: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.string(), // "tradition", "food", "travel", "family"
    images: v.optional(v.array(v.id("_storage"))),
    videos: v.optional(v.array(v.id("_storage"))),
    likes: v.number(),
    timestamp: v.number(),
    isPublic: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"]),

  // NEW: Story reactions
  storyReactions: defineTable({
    storyId: v.id("culturalStories"),
    userId: v.id("users"),
    reactionType: v.string(), // "❤️", "🔥", "👏", "😍", "🌟"
    timestamp: v.number(),
  })
    .index("by_story", ["storyId"])
    .index("by_user", ["userId"]),

  culturalEvents: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(), // "food", "music", "language", "travel"
    location: v.string(),
    dateTime: v.number(),
    maxParticipants: v.number(),
    currentParticipants: v.number(),
    hostId: v.id("users"),
    participants: v.array(v.id("users")),
    isActive: v.boolean(),
  })
    .index("by_category", ["category"])
    .index("by_host", ["hostId"])
    .index("by_date", ["dateTime"]),

  userInteractions: defineTable({
    userId: v.id("users"),
    targetUserId: v.id("users"),
    interactionType: v.string(), // "view", "like", "pass", "message"
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_target", ["targetUserId"])
    .index("by_type", ["interactionType"]),

  // NEW: UNO Games system
  unoLobbies: defineTable({
    name: v.string(),
    hostId: v.id("users"),
    players: v.array(v.id("users")),
    maxPlayers: v.number(),
    isActive: v.boolean(),
    status: v.string(), // "waiting", "playing", "finished"
    createdAt: v.number(),
  })
    .index("by_host", ["hostId"])
    .index("by_active", ["isActive"])
    .index("by_status", ["status"]),

  unoGames: defineTable({
    lobbyId: v.id("unoLobbies"),
    players: v.array(v.object({
      userId: v.id("users"),
      displayName: v.string(),
      hand: v.array(v.string()), // Card strings like "red_5", "wild", "skip_blue"
      isCurrentTurn: v.boolean(),
      hasSaidUno: v.boolean(),
      isWinner: v.boolean(),
    })),
    deck: v.array(v.string()),
    discardPile: v.array(v.string()),
    currentPlayerIndex: v.number(),
    direction: v.number(), // 1 for clockwise, -1 for counter-clockwise
    currentColor: v.string(), // Current color to match
    currentValue: v.string(), // Current value to match
    gameStatus: v.string(), // "waiting", "playing", "finished"
    winnerId: v.optional(v.id("users")),
    createdAt: v.number(),
    lastActionTime: v.number(),
  })
    .index("by_lobby", ["lobbyId"])
    .index("by_status", ["gameStatus"]),

  unoGameActions: defineTable({
    gameId: v.id("unoGames"),
    playerId: v.id("users"),
    actionType: v.string(), // "play_card", "draw_card", "say_uno", "skip_turn"
    cardPlayed: v.optional(v.string()),
    newColor: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_game", ["gameId"])
    .index("by_player", ["playerId"])
    .index("by_timestamp", ["timestamp"]),

  // NEW: News Feed system
  newsArticles: defineTable({
    title: v.string(),
    content: v.string(),
    summary: v.string(),
    category: v.string(), // "culture", "world", "technology", "lifestyle"
    authorId: v.id("users"),
    images: v.optional(v.array(v.id("_storage"))),
    tags: v.array(v.string()),
    likes: v.number(),
    views: v.number(),
    isPublished: v.boolean(),
    publishedAt: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_category", ["category"])
    .index("by_published", ["isPublished"])
    .index("by_timestamp", ["timestamp"]),

  newsLikes: defineTable({
    articleId: v.id("newsArticles"),
    userId: v.id("users"),
    timestamp: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_user", ["userId"]),

  // NEW: Notifications system
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "match", "message", "friend_request", "story_reaction"
    title: v.string(),
    message: v.string(),
    relatedUserId: v.optional(v.id("users")),
    relatedStoryId: v.optional(v.id("culturalStories")),
    relatedConversationId: v.optional(v.id("conversations")),
    isRead: v.boolean(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_read", ["isRead"])
    .index("by_timestamp", ["timestamp"]),

  reels: defineTable({
    userId: v.id("users"),
    video: v.id("_storage"),
    caption: v.string(),
    likes: v.number(),
    comments: v.number(),
    timestamp: v.number(),
    isPublic: v.boolean(),
  })
    .index("by_user", ["userId"]) 
    .index("by_public", ["isPublic"]),

  // Advanced: Likes for Reels
  reelLikes: defineTable({
    reelId: v.id("reels"),
    userId: v.id("users"),
    timestamp: v.number(),
  })
    .index("by_reel", ["reelId"])
    .index("by_user", ["userId"])
    .index("by_reel_and_user", ["reelId", "userId"]),

  // Advanced: Comments for Reels
  reelComments: defineTable({
    reelId: v.id("reels"),
    userId: v.id("users"),
    text: v.string(),
    timestamp: v.number(),
  })
    .index("by_reel", ["reelId"])
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

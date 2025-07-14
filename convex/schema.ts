import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    age: v.number(),
    bio: v.string(),
    location: v.string(),
    email: v.optional(v.string()),
    profileImageId: v.optional(v.id("_storage")),
    profileImageUrl: v.optional(v.string()),
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
  })
    .index("by_user", ["userId"])
    .index("by_age", ["age"])
    .index("by_location", ["location"]),

  matches: defineTable({
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    compatibilityScore: v.number(),
    sharedInterests: v.array(v.string()),
    status: v.string(), // "pending", "matched", "rejected"
  })
    .index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"])
    .index("by_status", ["status"]),

  friendRequests: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    status: v.string(), // "pending", "accepted", "rejected"
    timestamp: v.number(),
  })
    .index("by_from_user", ["fromUserId"])
    .index("by_to_user", ["toUserId"])
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
    lastMessage: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    unreadCount: v.object({
      user1: v.number(),
      user2: v.number(),
    }),
  })
    .index("by_participants", ["participants"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    timestamp: v.number(),
    messageType: v.string(), // "text", "image", "video"
    mediaId: v.optional(v.id("_storage")),
    isRead: v.boolean(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_timestamp", ["timestamp"]),

  stories: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    likes: v.number(),
    timestamp: v.number(),
    mediaId: v.optional(v.id("_storage")),
    mediaType: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_timestamp", ["timestamp"]),

  storyReactions: defineTable({
    storyId: v.id("culturalStories"),
    userId: v.id("users"),
    reactionType: v.string(), // "like", "love", "celebrate"
    timestamp: v.number(),
  })
    .index("by_story", ["storyId"])
    .index("by_user", ["userId"]),

  kandiConversations: defineTable({
    userId: v.id("users"),
    userMessage: v.string(),
    kandiResponse: v.string(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  gameScores: defineTable({
    userId: v.id("users"),
    gameType: v.string(), // "uno", "quiz", etc.
    score: v.number(),
    playerName: v.string(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_game_type", ["gameType"])
    .index("by_score", ["score"])
    .index("by_timestamp", ["timestamp"]),

  userInteractions: defineTable({
    userId: v.id("users"),
    targetUserId: v.id("users"),
    interactionType: v.string(), // "like", "pass", "super_like"
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_target", ["targetUserId"]),

  culturalPrompts: defineTable({
    category: v.string(),
    question: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
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

  culturalStories: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    likes: v.number(),
    timestamp: v.number(),
    isPublic: v.boolean(),
    images: v.optional(v.array(v.id("_storage"))),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"])
    .index("by_timestamp", ["timestamp"]),

  kandiMessages: defineTable({
    userId: v.id("users"),
    userMessage: v.string(),
    kandiResponse: v.string(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  unoQueue: defineTable({
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_joinedAt", ["joinedAt"]),

  unoGames: defineTable({
    playerIds: v.array(v.id("users")), // All players in the game
    state: v.string(), // JSON stringified game state
    currentTurn: v.number(), // Index in playerIds
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    winnerId: v.optional(v.id("users")),
  })
    .index("by_player", ["playerIds"])
    .index("by_startedAt", ["startedAt"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

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
    location: v.string(),
    
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
    likes: v.number(),
    timestamp: v.number(),
    isPublic: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"]),

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
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

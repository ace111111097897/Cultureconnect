import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const getUserConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allConversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const conversations = allConversations.filter(conv => 
      conv.participants.includes(userId)
    );

    // Get participant details and last message info
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipants = conversation.participants.filter(id => id !== userId);
        
        if (conversation.type === "direct" && otherParticipants.length === 1) {
          const otherProfile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", otherParticipants[0]))
            .unique();

          const profileImageUrl = otherProfile?.profileImage 
            ? await ctx.storage.getUrl(otherProfile.profileImage)
            : null;

          return {
            ...conversation,
            otherProfile: otherProfile ? {
              ...otherProfile,
              profileImageUrl,
            } : null,
          };
        }

        return conversation;
      })
    );

    return conversationsWithDetails.sort((a, b) => 
      (b.lastMessageTime || 0) - (a.lastMessageTime || 0)
    );
  },
});

export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    return messages;
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Conversation not found or not authorized");
    }

    try {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      content: args.content,
      messageType: "text",
      timestamp: Date.now(),
      isRead: false,
    });

    // Update conversation with last message info
    await ctx.db.patch(args.conversationId, {
      lastMessage: args.content,
      lastMessageTime: Date.now(),
    });

      return messageId;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }
  },
});

export const markMessagesAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Conversation not found or not authorized");
    }

    // Mark all unread messages in this conversation as read
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.neq(q.field("senderId"), userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const message of unreadMessages) {
      await ctx.db.patch(message._id, {
        isRead: true,
      });
    }
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Conversation not found or not authorized");
    }

    // Mark all unread messages in this conversation as read
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.neq(q.field("senderId"), userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const message of unreadMessages) {
      await ctx.db.patch(message._id, {
        isRead: true,
      });
    }
  },
});

export const getUnreadMessageCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const allConversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const userConversations = allConversations.filter(conv => 
      conv.participants.includes(userId)
    );

    let totalUnread = 0;

    for (const conversation of userConversations) {
      const unreadMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
        .filter((q) => q.neq(q.field("senderId"), userId))
        .filter((q) => q.eq(q.field("isRead"), false))
        .collect();

      totalUnread += unreadMessages.length;
    }

    return totalUnread;
  },
});

export const createConversation = mutation({
  args: {
    participantIds: v.array(v.id("users")),
    type: v.string(), // "direct" or "group"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Ensure the current user is in the participants
    if (!args.participantIds.includes(userId)) {
      throw new Error("Current user must be a participant");
    }

    try {
      const conversationId = await ctx.db.insert("conversations", {
        participants: args.participantIds,
        type: args.type,
        isActive: true,
        lastMessageTime: Date.now(),
      });

      return conversationId;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw new Error("Failed to create conversation");
    }
  },
});

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allConversations = await ctx.db
      .query("conversations")
      .collect();

    const conversations = allConversations.filter(conv => 
      conv.participants.includes(userId)
    );

    // Get participant details and last message info
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipants = conversation.participants.filter(id => id !== userId);
        
        if (otherParticipants.length === 1) {
          const otherProfile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", otherParticipants[0]))
            .unique();

          const profileImageUrl = otherProfile?.profileImageId 
            ? await ctx.storage.getUrl(otherProfile.profileImageId)
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
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify user is participant in conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Not authorized to view this conversation");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .take(args.limit || 50);

    // Get sender profiles
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const senderProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", message.senderId))
          .unique();

        return {
          ...message,
          sender: senderProfile,
        };
      })
    );

    return messagesWithSenders.reverse();
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    messageType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user is participant in conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Not authorized to send messages to this conversation");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      content: args.content,
      messageType: args.messageType || "text",
      timestamp: Date.now(),
      isRead: false,
    });

    // Update conversation with last message info
    await ctx.db.patch(args.conversationId, {
      lastMessage: args.content,
      lastMessageTime: Date.now(),
    });

    return messageId;
  },
});

export const markMessagesAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.neq(q.field("senderId"), userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const message of messages) {
      await ctx.db.patch(message._id, { isRead: true });
    }
  },
});

import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// chatWithKandi action has been moved to kandiActions.ts for Node.js compatibility.
// If needed, import and re-export here:
// export { chatWithKandi } from "./kandiActions";

// Persistent Kandi chat history
export const addKandiMessage = mutation({
  args: { from: v.union(v.literal("user"), v.literal("kandi")), text: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("kandiChats", {
      userId,
      from: args.from,
      text: args.text,
      timestamp: Date.now(),
    });
  },
});

export const getKandiChat = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const messages = await ctx.db
      .query("kandiChats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
    return messages;
  },
}); 
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createUnoGameWithFriend = mutation({
  args: { friendUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (userId === args.friendUserId) throw new Error("Cannot play with yourself");
    // Check if they are friends
    const isFriend = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .filter((q) => q.eq(q.field("user2Id"), args.friendUserId))
      .unique()
      || await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .filter((q) => q.eq(q.field("user1Id"), args.friendUserId))
      .unique();
    if (!isFriend) throw new Error("You can only invite friends to play UNO");
    // Check if a game already exists between these two users
    const existingGame = await ctx.db
      .query("unoGames")
      .filter((q) => q.contains(q.field("playerIds"), userId) && q.contains(q.field("playerIds"), args.friendUserId))
      .collect();
    if (existingGame.length > 0) {
      return { alreadyExists: true, gameId: existingGame[0]._id };
    }
    // Create initial game state
    const playerIds = [userId, args.friendUserId];
    const initialState = JSON.stringify({
      playerHands: playerIds.map(() => []),
      deck: [],
      discard: [],
      currentCard: null,
      direction: 1,
      turn: 0,
      started: true,
    });
    const gameId = await ctx.db.insert("unoGames", {
      playerIds,
      state: initialState,
      currentTurn: 0,
      startedAt: Date.now(),
    });
    return { gameId };
  },
});

export const getUnoGameForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const games = await ctx.db
      .query("unoGames")
      .collect();
    const game = games.find(g => g.playerIds.includes(userId));
    return game || null;
  },
});

export const playUnoCard = mutation({
  args: { card: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const games = await ctx.db
      .query("unoGames")
      .collect();
    const game = games.find(g => g.playerIds.includes(userId));
    if (!game) throw new Error("No active game");
    // TODO: Implement UNO game logic here (update state, check turn, etc.)
    return { success: true };
  },
});

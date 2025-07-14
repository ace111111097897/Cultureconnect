import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const scores = await ctx.db
      .query("gameScores")
      .withIndex("by_score")
      .order("desc")
      .take(20);

    return Promise.all(
      scores.map(async (score) => {
        const user = await ctx.db.get(score.userId);
        return {
          ...score,
          playerName: user?.name || "Anonymous Player",
        };
      })
    );
  },
});

export const submitScore = mutation({
  args: {
    gameType: v.string(),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.insert("gameScores", {
      userId,
      gameType: args.gameType,
      score: args.score,
      playerName: user.name || "Anonymous Player",
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const userScores = await ctx.db
      .query("gameScores")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const unoScores = userScores.filter(s => s.gameType === "uno");
    const quizScores = userScores.filter(s => s.gameType === "quiz");

    return {
      totalGames: userScores.length,
      bestUnoScore: Math.max(...unoScores.map(s => s.score), 0),
      bestQuizScore: Math.max(...quizScores.map(s => s.score), 0),
      totalScore: userScores.reduce((sum, s) => sum + s.score, 0),
    };
  },
});

export const joinUnoQueue = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    // Check if already in queue
    const existing = await ctx.db
      .query("unoQueue")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) return { alreadyQueued: true };
    await ctx.db.insert("unoQueue", {
      userId,
      joinedAt: Date.now(),
    });
    return { success: true };
  },
});

export const leaveUnoQueue = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("unoQueue")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return { success: true };
  },
});

export const getUnoQueue = query({
  args: {},
  handler: async (ctx) => {
    const queue = await ctx.db
      .query("unoQueue")
      .order("asc")
      .collect();
    return queue;
  },
});

export const matchPlayersToGame = mutation({
  args: { minPlayers: v.number(), maxPlayers: v.number() },
  handler: async (ctx, args) => {
    // Get users in queue
    const queue = await ctx.db
      .query("unoQueue")
      .order("asc")
      .collect();
    if (queue.length < args.minPlayers) return { started: false };
    const players = queue.slice(0, args.maxPlayers);
    const playerIds = players.map(q => q.userId);
    // Remove from queue
    for (const q of players) {
      await ctx.db.delete(q._id);
    }
    // Create initial game state
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
    return { started: true, gameId };
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

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createUnoLobby = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    // Create a new lobby with the creator as the first player
    const lobbyId = await ctx.db.insert("unoLobbies", {
      creatorId: userId,
      playerIds: [userId],
      status: "open",
      createdAt: Date.now(),
    });
    return { lobbyId };
  },
});

export const listUnoLobbies = query({
  args: {},
  handler: async (ctx) => {
    // List all open lobbies
    return await ctx.db
      .query("unoLobbies")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("asc")
      .collect();
  },
});

export const joinUnoLobby = mutation({
  args: { lobbyId: v.id("unoLobbies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");
    if (lobby.status !== "open") throw new Error("Lobby is not open");
    if (lobby.playerIds.includes(userId)) return { alreadyJoined: true };
    // Add user to lobby
    await ctx.db.patch(args.lobbyId, {
      playerIds: [...lobby.playerIds, userId],
    });
    return { joined: true };
  },
});

export const leaveUnoLobby = mutation({
  args: { lobbyId: v.id("unoLobbies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");
    if (!lobby.playerIds.includes(userId)) return { notInLobby: true };
    const newPlayers = lobby.playerIds.filter((id) => id !== userId);
    if (newPlayers.length === 0) {
      // Delete lobby if empty
      await ctx.db.delete(args.lobbyId);
      return { deleted: true };
    }
    await ctx.db.patch(args.lobbyId, {
      playerIds: newPlayers,
    });
    return { left: true };
  },
});

export const startUnoLobbyGame = mutation({
  args: { lobbyId: v.id("unoLobbies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");
    if (lobby.creatorId !== userId) throw new Error("Only the creator can start the game");
    if (lobby.status !== "open") throw new Error("Lobby is not open");
    if (lobby.playerIds.length < 2) throw new Error("Need at least 2 players to start");
    // Create initial game state
    const playerIds = lobby.playerIds;
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
    await ctx.db.patch(args.lobbyId, {
      status: "started",
      gameId,
    });
    return { started: true, gameId };
  },
}); 
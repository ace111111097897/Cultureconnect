import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";

// Simple UNO game lobby
export const getUnoLobbies = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("unoLobbies"),
    _creationTime: v.number(),
    name: v.string(),
    hostId: v.id("users"),
    players: v.array(v.id("users")),
    maxPlayers: v.number(),
    isActive: v.boolean(),
    status: v.string(), // "waiting", "playing", "finished"
  })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const lobbies = await ctx.db
      .query("unoLobbies")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return lobbies;
  },
});

// Create UNO lobby
export const createUnoLobby = mutation({
  args: {
    name: v.string(),
    maxPlayers: v.number(),
  },
  returns: v.id("unoLobbies"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("unoLobbies", {
      name: args.name,
      hostId: userId,
      players: [userId],
      maxPlayers: args.maxPlayers,
      isActive: true,
      status: "waiting",
    });
  },
});

// Join UNO lobby
export const joinUnoLobby = mutation({
  args: {
    lobbyId: v.id("unoLobbies"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");

    if (lobby.players.length >= lobby.maxPlayers) {
      throw new Error("Lobby is full");
    }

    if (lobby.players.includes(userId)) {
      throw new Error("Already in lobby");
    }

    await ctx.db.patch(args.lobbyId, {
      players: [...lobby.players, userId],
    });

    return true;
  },
});

// Leave UNO lobby
export const leaveUnoLobby = mutation({
  args: {
    lobbyId: v.id("unoLobbies"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");

    const updatedPlayers = lobby.players.filter(id => id !== userId);
    
    if (updatedPlayers.length === 0) {
      // Delete lobby if no players left
      await ctx.db.delete(args.lobbyId);
    } else {
      // Update lobby with remaining players
      await ctx.db.patch(args.lobbyId, {
        players: updatedPlayers,
        hostId: updatedPlayers[0], // First player becomes host
      });
    }

    return true;
  },
});

// Start UNO game
export const startUnoGame = mutation({
  args: {
    lobbyId: v.id("unoLobbies"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");

    if (lobby.hostId !== userId) {
      throw new Error("Only host can start the game");
    }

    if (lobby.players.length < 2) {
      throw new Error("Need at least 2 players to start");
    }

    await ctx.db.patch(args.lobbyId, {
      status: "playing",
    });

    return true;
  },
});

// Get user's game history
export const getUserGameHistory = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("unoLobbies"),
    _creationTime: v.number(),
    name: v.string(),
    status: v.string(),
    playerCount: v.number(),
  })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const lobbies = await ctx.db
      .query("unoLobbies")
      .filter((q) => q.eq(q.field("status"), "finished"))
      .collect();

    const userLobbies = lobbies.filter(lobby => 
      lobby.players.includes(userId)
    );

    return userLobbies.map(lobby => ({
      _id: lobby._id,
      _creationTime: lobby._creationTime,
      name: lobby.name,
      status: lobby.status,
      playerCount: lobby.players.length,
    }));
  },
});

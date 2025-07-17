import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const fullDeck = [
  // Add all UNO cards (0–9, skip, reverse, +2, +4, wild, etc)
  "R1", "R2", "G1", "B5", "Y+2", "WILD", "+4" // ... complete as needed
];

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const createLobby = mutation({
  args: { name: v.string(), userId: v.string(), username: v.string() },
  handler: async (ctx, args) => {
    const deck = shuffle([...fullDeck]);
    const hand = deck.splice(0, 7); // draw 7 cards

    return await ctx.db.insert("lobbies", {
      name: args.name,
      players: [{ userId: args.userId, username: args.username, hand }],
      deck,
      discardPile: [],
      currentPlayerIndex: 0,
      direction: "clockwise",
      isStarted: false,
    });
  },
});

export const joinLobby = mutation({
  args: { lobbyId: v.id("lobbies"), userId: v.string(), username: v.string() },
  handler: async (ctx, { lobbyId, userId, username }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) throw new Error("Lobby not found");

    const deck = lobby.deck;
    const hand = deck.splice(0, 7);

    const updatedPlayers = [...lobby.players, { userId, username, hand }];
    await ctx.db.patch(lobbyId, {
      players: updatedPlayers,
      deck,
    });
  },
});

export const getLobby = query({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lobbyId);
  },
});

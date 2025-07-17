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

export const listLobbies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("lobbies").collect();
  },
});

export const getActiveLobbies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("lobbies").collect();
  },
});

export const startGame = mutation({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) throw new Error("Lobby not found");
    if (lobby.isStarted) throw new Error("Game already started");
    if (lobby.players.length < 2) throw new Error("Need at least 2 players");

    // Create and shuffle a new deck
    const deck = shuffle([...fullDeck]);
    // Deal 7 cards to each player
    const players = lobby.players.map(p => ({
      ...p,
      hand: deck.splice(0, 7),
    }));
    // Set up discard pile with first non-wild card
    let firstCard = deck.pop();
    while (firstCard && (firstCard.includes("WILD") || firstCard.includes("+4"))) {
      deck.unshift(firstCard); // put wilds back in deck
      firstCard = deck.pop();
    }
    const discardPile = firstCard ? [firstCard] : [];
    await ctx.db.patch(lobbyId, {
      players,
      deck,
      discardPile,
      currentPlayerIndex: 0,
      isStarted: true,
    });
  },
});

export const playCard = mutation({
  args: { lobbyId: v.id("lobbies"), userId: v.string(), card: v.string() },
  handler: async (ctx, { lobbyId, userId, card }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) throw new Error("Lobby not found");
    if (!lobby.isStarted) throw new Error("Game not started");
    const playerIndex = lobby.players.findIndex(p => p.userId === userId);
    if (playerIndex === -1) throw new Error("Player not in lobby");
    if (lobby.currentPlayerIndex !== playerIndex) throw new Error("Not your turn");
    const player = lobby.players[playerIndex];
    if (!player.hand.includes(card)) throw new Error("You don't have that card");
    // Validate card play (simple: must match color or value or be wild)
    const topCard = lobby.discardPile[lobby.discardPile.length - 1];
    const match = card[0] === topCard[0] || card.slice(1) === topCard.slice(1) || card.includes("WILD") || topCard.includes("WILD");
    if (!match) throw new Error("Card does not match");
    // Remove card from hand
    const newHand = player.hand.filter(c => c !== card);
    // Add card to discard pile
    const newDiscardPile = [...lobby.discardPile, card];
    // Advance turn
    let nextPlayerIndex = (lobby.currentPlayerIndex + 1) % lobby.players.length;
    // TODO: handle special cards (reverse, skip, draw2, wild+4)
    // Check for win
    let isStarted = lobby.isStarted;
    let winner: string | undefined = lobby.winner;
    if (newHand.length === 0) {
      isStarted = true; // Game over, set to true for type
      winner = userId;
    }
    // Update players array
    const newPlayers = lobby.players.map((p, i) =>
      i === playerIndex ? { ...p, hand: newHand } : p
    );
    await ctx.db.patch(lobbyId, {
      players: newPlayers,
      discardPile: newDiscardPile,
      currentPlayerIndex: nextPlayerIndex,
      isStarted,
      winner,
    });
  },
});

export const drawCard = mutation({
  args: { lobbyId: v.id("lobbies"), userId: v.string() },
  handler: async (ctx, { lobbyId, userId }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) throw new Error("Lobby not found");
    if (!lobby.isStarted) throw new Error("Game not started");
    const playerIndex = lobby.players.findIndex(p => p.userId === userId);
    if (playerIndex === -1) throw new Error("Player not in lobby");
    if (lobby.currentPlayerIndex !== playerIndex) throw new Error("Not your turn");
    let deck = [...lobby.deck];
    let discardPile = [...lobby.discardPile];
    // If deck is empty, reshuffle discard pile (except top card)
    if (deck.length === 0 && discardPile.length > 1) {
      const top = discardPile.pop();
      deck = shuffle(discardPile);
      discardPile = [top || "R1"];
    }
    if (deck.length === 0) throw new Error("No cards left to draw");
    const safeCard = deck.pop() || "R1";
    // Add card to player's hand
    const newPlayers = lobby.players.map((p, i) =>
      i === playerIndex ? { ...p, hand: [...p.hand, safeCard] } : p
    );
    // Advance turn
    let nextPlayerIndex = (lobby.currentPlayerIndex + 1) % lobby.players.length;
    await ctx.db.patch(lobbyId, {
      players: newPlayers,
      deck,
      discardPile,
      currentPlayerIndex: nextPlayerIndex,
    });
  },
});

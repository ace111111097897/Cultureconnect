import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// UNO Card definitions
const UNO_CARDS = {
  // Number cards (0-9) for each color
  red: ["red_0", "red_1", "red_2", "red_3", "red_4", "red_5", "red_6", "red_7", "red_8", "red_9"],
  blue: ["blue_0", "blue_1", "blue_2", "blue_3", "blue_4", "blue_5", "blue_6", "blue_7", "blue_8", "blue_9"],
  green: ["green_0", "green_1", "green_2", "green_3", "green_4", "green_5", "green_6", "green_7", "green_8", "green_9"],
  yellow: ["yellow_0", "yellow_1", "yellow_2", "yellow_3", "yellow_4", "yellow_5", "yellow_6", "yellow_7", "yellow_8", "yellow_9"],
  
  // Action cards (2 of each per color)
  skip: ["skip_red", "skip_blue", "skip_green", "skip_yellow"],
  reverse: ["reverse_red", "reverse_blue", "reverse_green", "reverse_yellow"],
  draw2: ["draw2_red", "draw2_blue", "draw2_green", "draw2_yellow"],
  
  // Wild cards (4 of each)
  wild: ["wild", "wild", "wild", "wild"],
  wildDraw4: ["wildDraw4", "wildDraw4", "wildDraw4", "wildDraw4"],
};

// Helper function to create a full UNO deck
function createUnoDeck() {
  const deck: string[] = [];
  
  // Add number cards (2 of each except 0)
  Object.values(UNO_CARDS.red).forEach(card => {
    if (card.includes("_0")) {
      deck.push(card); // Only one 0 card per color
    } else {
      deck.push(card, card); // Two of each number 1-9
    }
  });
  
  Object.values(UNO_CARDS.blue).forEach(card => {
    if (card.includes("_0")) {
      deck.push(card);
    } else {
      deck.push(card, card);
    }
  });
  
  Object.values(UNO_CARDS.green).forEach(card => {
    if (card.includes("_0")) {
      deck.push(card);
    } else {
      deck.push(card, card);
    }
  });
  
  Object.values(UNO_CARDS.yellow).forEach(card => {
    if (card.includes("_0")) {
      deck.push(card);
    } else {
      deck.push(card, card);
    }
  });
  
  // Add action cards (2 of each)
  UNO_CARDS.skip.forEach(card => {
    deck.push(card, card);
  });
  
  UNO_CARDS.reverse.forEach(card => {
    deck.push(card, card);
  });
  
  UNO_CARDS.draw2.forEach(card => {
    deck.push(card, card);
  });
  
  // Add wild cards (4 of each)
  UNO_CARDS.wild.forEach(card => {
    deck.push(card);
  });
  
  UNO_CARDS.wildDraw4.forEach(card => {
    deck.push(card);
  });
  
  return deck;
}

// Helper function to shuffle deck
function shuffleDeck(deck: string[]) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper function to deal cards
function dealCards(deck: string[], numPlayers: number) {
  const hands: string[][] = [];
  for (let i = 0; i < numPlayers; i++) {
    hands.push([]);
  }
  
  // Deal 7 cards to each player
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < numPlayers; j++) {
      if (deck.length > 0) {
        hands[j].push(deck.pop()!);
      }
    }
  }
  
  return hands;
}

// Helper function to check if a card can be played
function canPlayCard(card: string, currentColor: string, currentValue: string) {
  if (card.startsWith("wild")) {
    return true; // Wild cards can always be played
  }
  
  const [color, value] = card.split("_");
  return color === currentColor || value === currentValue;
}

// Helper function to get card color
function getCardColor(card: string) {
  if (card.startsWith("wild")) {
    return "wild";
  }
  return card.split("_")[0];
}

// Helper function to get card value
function getCardValue(card: string) {
  if (card.startsWith("wild")) {
    return "wild";
  }
  return card.split("_")[1];
}

// Get all active lobbies
export const getActiveLobbies = query({
  args: {},
  handler: async (ctx) => {
    const lobbies = await ctx.db
      .query("unoLobbies")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.eq(q.field("status"), "waiting"))
      .collect();
    
    // Get player profiles for each lobby
    const lobbiesWithProfiles = await Promise.all(
      lobbies.map(async (lobby) => {
        const playerProfiles = await Promise.all(
          lobby.players.map(async (playerId) => {
            const profile = await ctx.db
              .query("profiles")
              .withIndex("by_user", (q) => q.eq("userId", playerId))
              .unique();
            return {
              userId: playerId,
              displayName: profile?.displayName || "Unknown Player",
            };
          })
        );
        
        return {
          ...lobby,
          playerProfiles,
        };
      })
    );
    
    return lobbiesWithProfiles;
  },
});

// Create a new lobby
export const createLobby = mutation({
  args: {
    name: v.string(),
    maxPlayers: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    if (args.maxPlayers < 2 || args.maxPlayers > 10) {
      throw new Error("Max players must be between 2 and 10");
    }
    
    const lobbyId = await ctx.db.insert("unoLobbies", {
      name: args.name,
      hostId: userId,
      players: [userId],
      maxPlayers: args.maxPlayers,
      isActive: true,
      status: "waiting",
      createdAt: Date.now(),
    });
    
    return lobbyId;
  },
});

// Join a lobby
export const joinLobby = mutation({
  args: {
    lobbyId: v.id("unoLobbies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");
    
    if (lobby.status !== "waiting") {
      throw new Error("Lobby is not accepting players");
    }
    
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

// Leave a lobby
export const leaveLobby = mutation({
  args: {
    lobbyId: v.id("unoLobbies"),
  },
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
        hostId: updatedPlayers[0], // First remaining player becomes host
      });
    }
    
    return true;
  },
});

// Start a game
export const startGame = mutation({
  args: {
    lobbyId: v.id("unoLobbies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");
    
    if (lobby.hostId !== userId) {
      throw new Error("Only the host can start the game");
    }
    
    if (lobby.players.length < 2) {
      throw new Error("Need at least 2 players to start");
    }
    
    // Create deck and shuffle
    const deck = shuffleDeck(createUnoDeck());
    
    // Deal cards
    const hands = dealCards(deck, lobby.players.length);
    
    // Get player profiles
    const playerProfiles = await Promise.all(
      lobby.players.map(async (playerId) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", playerId))
          .unique();
        return {
          userId: playerId,
          displayName: profile?.displayName || "Unknown Player",
        };
      })
    );
    
    // Create game state
    const players = playerProfiles.map((profile, index) => ({
      userId: profile.userId,
      displayName: profile.displayName,
      hand: hands[index],
      isCurrentTurn: index === 0,
      hasSaidUno: false,
      isWinner: false,
    }));
    
    // Find first non-wild card for discard pile
    let firstCard = deck.pop()!;
    while (firstCard.startsWith("wild")) {
      deck.push(firstCard);
      firstCard = deck.pop()!;
    }
    
    const gameId = await ctx.db.insert("unoGames", {
      lobbyId: args.lobbyId,
      players,
      deck,
      discardPile: [firstCard],
      currentPlayerIndex: 0,
      direction: 1,
      currentColor: getCardColor(firstCard),
      currentValue: getCardValue(firstCard),
      gameStatus: "playing",
      createdAt: Date.now(),
      lastActionTime: Date.now(),
    });
    
    // Update lobby status
    await ctx.db.patch(args.lobbyId, {
      status: "playing",
    });
    
    return gameId;
  },
});

// Get game state
export const getGameState = query({
  args: {
    gameId: v.id("unoGames"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return null;
    
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    // Find current player's hand
    const currentPlayer = game.players.find(p => p.userId === userId);
    if (!currentPlayer) return null;
    
    // Return game state with current player's hand
    return {
      ...game,
      currentPlayerHand: currentPlayer.hand,
      isCurrentPlayerTurn: currentPlayer.isCurrentTurn,
    };
  },
});

// Play a card
export const playCard = mutation({
  args: {
    gameId: v.id("unoGames"),
    cardIndex: v.number(),
    newColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    
    if (game.gameStatus !== "playing") {
      throw new Error("Game is not active");
    }
    
    const currentPlayer = game.players.find(p => p.userId === userId);
    if (!currentPlayer) throw new Error("Not in this game");
    
    if (!currentPlayer.isCurrentTurn) {
      throw new Error("Not your turn");
    }
    
    const card = currentPlayer.hand[args.cardIndex];
    if (!card) throw new Error("Invalid card index");
    
    if (!canPlayCard(card, game.currentColor, game.currentValue)) {
      throw new Error("Cannot play this card");
    }
    
    // Remove card from hand
    const newHand = [...currentPlayer.hand];
    newHand.splice(args.cardIndex, 1);
    
    // Check if player has said UNO
    if (newHand.length === 1 && !currentPlayer.hasSaidUno) {
      // Player must say UNO or draw 2 cards
      const penaltyCards = game.deck.slice(-2);
      newHand.push(...penaltyCards);
      game.deck.splice(-2);
    }
    
    // Update game state
    const updatedPlayers = game.players.map(p => 
      p.userId === userId 
        ? { ...p, hand: newHand, isCurrentTurn: false, hasSaidUno: false }
        : { ...p, isCurrentTurn: false }
    );
    
    // Add card to discard pile
    const newDiscardPile = [...game.discardPile, card];
    
    // Handle special cards
    let nextPlayerIndex = game.currentPlayerIndex;
    let newDirection = game.direction;
    let newColor = game.currentColor;
    let newValue = game.currentValue;
    
    if (card.startsWith("wild")) {
      if (!args.newColor) throw new Error("Must specify color for wild card");
      newColor = args.newColor;
      newValue = "wild";
      
      if (card === "wildDraw4") {
        // Next player draws 4 cards and skips turn
        const nextPlayer = updatedPlayers[(game.currentPlayerIndex + game.direction + updatedPlayers.length) % updatedPlayers.length];
        const drawCards = game.deck.slice(-4);
        nextPlayer.hand.push(...drawCards);
        game.deck.splice(-4);
        nextPlayerIndex = (nextPlayerIndex + game.direction * 2 + updatedPlayers.length) % updatedPlayers.length;
      }
    } else if (card.includes("skip")) {
      nextPlayerIndex = (nextPlayerIndex + game.direction * 2 + updatedPlayers.length) % updatedPlayers.length;
    } else if (card.includes("reverse")) {
      newDirection = -game.direction;
      nextPlayerIndex = (nextPlayerIndex + newDirection + updatedPlayers.length) % updatedPlayers.length;
    } else if (card.includes("draw2")) {
      // Next player draws 2 cards and skips turn
      const nextPlayer = updatedPlayers[(game.currentPlayerIndex + game.direction + updatedPlayers.length) % updatedPlayers.length];
      const drawCards = game.deck.slice(-2);
      nextPlayer.hand.push(...drawCards);
      game.deck.splice(-2);
      nextPlayerIndex = (nextPlayerIndex + game.direction * 2 + updatedPlayers.length) % updatedPlayers.length;
    } else {
      // Regular card
      nextPlayerIndex = (nextPlayerIndex + game.direction + updatedPlayers.length) % updatedPlayers.length;
    }
    
    // Check for winner
    let gameStatus = game.gameStatus;
    let winnerId = game.winnerId;
    
    if (newHand.length === 0) {
      gameStatus = "finished";
      winnerId = userId;
    }
    
    // Set next player's turn
    updatedPlayers[nextPlayerIndex].isCurrentTurn = true;
    
    // Record action
    await ctx.db.insert("unoGameActions", {
      gameId: args.gameId,
      playerId: userId,
      actionType: "play_card",
      cardPlayed: card,
      newColor: args.newColor,
      timestamp: Date.now(),
    });
    
    // Update game
    await ctx.db.patch(args.gameId, {
      players: updatedPlayers,
      deck: game.deck,
      discardPile: newDiscardPile,
      currentPlayerIndex: nextPlayerIndex,
      direction: newDirection,
      currentColor: newColor,
      currentValue: newValue,
      gameStatus,
      winnerId,
      lastActionTime: Date.now(),
    });
    
    return true;
  },
});

// Draw a card
export const drawCard = mutation({
  args: {
    gameId: v.id("unoGames"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    
    if (game.gameStatus !== "playing") {
      throw new Error("Game is not active");
    }
    
    const currentPlayer = game.players.find(p => p.userId === userId);
    if (!currentPlayer) throw new Error("Not in this game");
    
    if (!currentPlayer.isCurrentTurn) {
      throw new Error("Not your turn");
    }
    
    // Draw a card
    if (game.deck.length === 0) {
      // Reshuffle discard pile (except top card)
      const topCard = game.discardPile[game.discardPile.length - 1];
      const reshuffleCards = game.discardPile.slice(0, -1);
      const newDeck = shuffleDeck(reshuffleCards);
      game.deck = newDeck;
      game.discardPile = [topCard];
    }
    
    const drawnCard = game.deck.pop()!;
    const newHand = [...currentPlayer.hand, drawnCard];
    
    // Update players
    const updatedPlayers = game.players.map(p => 
      p.userId === userId 
        ? { ...p, hand: newHand, isCurrentTurn: false }
        : { ...p, isCurrentTurn: false }
    );
    
    // Move to next player
    const nextPlayerIndex = (game.currentPlayerIndex + game.direction + updatedPlayers.length) % updatedPlayers.length;
    updatedPlayers[nextPlayerIndex].isCurrentTurn = true;
    
    // Record action
    await ctx.db.insert("unoGameActions", {
      gameId: args.gameId,
      playerId: userId,
      actionType: "draw_card",
      timestamp: Date.now(),
    });
    
    // Update game
    await ctx.db.patch(args.gameId, {
      players: updatedPlayers,
      deck: game.deck,
      currentPlayerIndex: nextPlayerIndex,
      lastActionTime: Date.now(),
    });
    
    return true;
  },
});

// Say UNO
export const sayUno = mutation({
  args: {
    gameId: v.id("unoGames"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    
    const currentPlayer = game.players.find(p => p.userId === userId);
    if (!currentPlayer) throw new Error("Not in this game");
    
    if (currentPlayer.hand.length !== 1) {
      throw new Error("Can only say UNO with 1 card");
    }
    
    // Update player's UNO status
    const updatedPlayers = game.players.map(p => 
      p.userId === userId 
        ? { ...p, hasSaidUno: true }
        : p
    );
    
    // Record action
    await ctx.db.insert("unoGameActions", {
      gameId: args.gameId,
      playerId: userId,
      actionType: "say_uno",
      timestamp: Date.now(),
    });
    
    // Update game
    await ctx.db.patch(args.gameId, {
      players: updatedPlayers,
      lastActionTime: Date.now(),
    });
    
    return true;
  },
});

// Get game history
export const getGameHistory = query({
  args: {
    gameId: v.id("unoGames"),
  },
  handler: async (ctx, args) => {
    const actions = await ctx.db
      .query("unoGameActions")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .order("desc")
      .take(50);
    
    return actions.reverse();
  },
});

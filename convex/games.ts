import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";

// Get available trivia games
export const getTriviaGames = query({
  args: {
    category: v.optional(v.string()),
  },
  returns: v.array(v.object({
    _id: v.id("triviaGames"),
    _creationTime: v.number(),
    title: v.string(),
    category: v.string(),
    timeLimit: v.number(),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    timestamp: v.number(),
  })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let gamesQuery = ctx.db
      .query("triviaGames")
      .filter((q) => q.eq(q.field("isActive"), true));

    if (args.category) {
      gamesQuery = gamesQuery.filter((q) => q.eq(q.field("category"), args.category));
    }

    const games = await gamesQuery.collect();
    return games;
  },
});

// Get active trivia sessions
export const getActiveTriviaSessions = query({
  args: {
    isPublic: v.optional(v.boolean()),
  },
  returns: v.array(v.object({
    _id: v.id("triviaSessions"),
    _creationTime: v.number(),
    gameId: v.id("triviaGames"),
    players: v.array(v.object({
      userId: v.id("users"),
      score: v.number(),
      answers: v.array(v.object({
        questionIndex: v.number(),
        selectedAnswer: v.number(),
        isCorrect: v.boolean(),
        timeSpent: v.number(),
      })),
      completedAt: v.optional(v.number()),
    })),
    status: v.string(),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    maxPlayers: v.number(),
    isPublic: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let sessionsQuery = ctx.db
      .query("triviaSessions")
      .filter((q) => q.neq(q.field("status"), "completed"));

    if (args.isPublic !== undefined) {
      sessionsQuery = sessionsQuery.filter((q) => q.eq(q.field("isPublic"), args.isPublic));
    }

    const sessions = await sessionsQuery.collect();
    return sessions;
  },
});

// Create a new trivia game
export const createTriviaGame = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    questions: v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.number(),
      explanation: v.optional(v.string()),
    })),
    timeLimit: v.number(),
  },
  returns: v.id("triviaGames"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.questions.length === 0) {
      throw new Error("At least one question is required");
    }

    return await ctx.db.insert("triviaGames", {
      title: args.title,
      category: args.category,
      questions: args.questions,
      timeLimit: args.timeLimit,
      isActive: true,
      createdBy: userId,
      timestamp: Date.now(),
    });
  },
});

// Join a trivia session
export const joinTriviaSession = mutation({
  args: {
    sessionId: v.id("triviaSessions"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    if (session.status !== "waiting") {
      throw new Error("Session is not accepting new players");
    }

    if (session.players.length >= session.maxPlayers) {
      throw new Error("Session is full");
    }

    // Check if user is already in the session
    const isAlreadyInSession = session.players.some(player => player.userId === userId);
    if (isAlreadyInSession) {
      throw new Error("Already in session");
    }

    // Add player to session
    const updatedPlayers = [
      ...session.players,
      {
        userId,
        score: 0,
        answers: [],
        completedAt: undefined,
      }
    ];

    await ctx.db.patch(args.sessionId, {
      players: updatedPlayers,
    });

    return true;
  },
});

// Start a trivia session
export const startTriviaSession = mutation({
  args: {
    sessionId: v.id("triviaSessions"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    if (session.status !== "waiting") {
      throw new Error("Session already started");
    }

    if (session.players.length < 2) {
      throw new Error("Need at least 2 players to start");
    }

    await ctx.db.patch(args.sessionId, {
      status: "active",
      startedAt: Date.now(),
    });

    return true;
  },
});

// Submit answer for trivia question
export const submitTriviaAnswer = mutation({
  args: {
    sessionId: v.id("triviaSessions"),
    questionIndex: v.number(),
    selectedAnswer: v.number(),
    timeSpent: v.number(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    if (session.status !== "active") {
      throw new Error("Session is not active");
    }

    const game = await ctx.db.get(session.gameId);
    if (!game) throw new Error("Game not found");

    if (args.questionIndex >= game.questions.length) {
      throw new Error("Invalid question index");
    }

    const question = game.questions[args.questionIndex];
    const isCorrect = args.selectedAnswer === question.correctAnswer;

    // Find and update player
    const playerIndex = session.players.findIndex(player => player.userId === userId);
    if (playerIndex === -1) throw new Error("Player not found in session");

    const updatedPlayers = [...session.players];
    const player = { ...updatedPlayers[playerIndex] };

    // Add answer
    player.answers.push({
      questionIndex: args.questionIndex,
      selectedAnswer: args.selectedAnswer,
      isCorrect,
      timeSpent: args.timeSpent,
    });

    // Update score
    if (isCorrect) {
      player.score += 10;
    }

    // Check if player completed all questions
    if (player.answers.length === game.questions.length) {
      player.completedAt = Date.now();
    }

    updatedPlayers[playerIndex] = player;

    // Check if all players completed
    const allCompleted = updatedPlayers.every(player => 
      player.answers.length === game.questions.length
    );

    await ctx.db.patch(args.sessionId, {
      players: updatedPlayers,
      status: allCompleted ? "completed" : "active",
      endedAt: allCompleted ? Date.now() : undefined,
    });

    return true;
  },
});

// Create a new trivia session
export const createTriviaSession = mutation({
  args: {
    gameId: v.id("triviaGames"),
    maxPlayers: v.number(),
    isPublic: v.boolean(),
  },
  returns: v.id("triviaSessions"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    if (!game.isActive) {
      throw new Error("Game is not active");
    }

    return await ctx.db.insert("triviaSessions", {
      gameId: args.gameId,
      players: [{
        userId,
        score: 0,
        answers: [],
        completedAt: undefined,
      }],
      status: "waiting",
      maxPlayers: args.maxPlayers,
      isPublic: args.isPublic,
    });
  },
});

// Get user's trivia history
export const getUserTriviaHistory = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("triviaSessions"),
    _creationTime: v.number(),
    gameId: v.id("triviaGames"),
    gameTitle: v.string(),
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    completedAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const sessions = await ctx.db
      .query("triviaSessions")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const userHistory = [];

    for (const session of sessions) {
      const player = session.players.find(p => p.userId === userId);
      if (player) {
        const game = await ctx.db.get(session.gameId);
        if (game) {
          const correctAnswers = player.answers.filter(a => a.isCorrect).length;
          userHistory.push({
            _id: session._id,
            _creationTime: session._creationTime,
            gameId: session.gameId,
            gameTitle: game.title,
            score: player.score,
            totalQuestions: game.questions.length,
            correctAnswers,
            completedAt: player.completedAt,
          });
        }
      }
    }

    return userHistory.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  },
});

// Get trivia leaderboard
export const getTriviaLeaderboard = query({
  args: {
    gameId: v.optional(v.id("triviaGames")),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    userId: v.id("users"),
    displayName: v.string(),
    totalScore: v.number(),
    gamesPlayed: v.number(),
    averageScore: v.number(),
  })),
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("triviaSessions")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const userStats = new Map();

    for (const session of sessions) {
      if (args.gameId && session.gameId !== args.gameId) continue;

      for (const player of session.players) {
        if (!userStats.has(player.userId)) {
          userStats.set(player.userId, {
            userId: player.userId,
            totalScore: 0,
            gamesPlayed: 0,
          });
        }

        const stats = userStats.get(player.userId);
        stats.totalScore += player.score;
        stats.gamesPlayed += 1;
      }
    }

    // Get user profiles for display names
    const leaderboard = [];
    for (const [userId, stats] of userStats) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();

      if (profile) {
        leaderboard.push({
          ...stats,
          displayName: profile.displayName,
          averageScore: Math.round(stats.totalScore / stats.gamesPlayed),
        });
      }
    }

    // Sort by total score and limit results
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    return leaderboard.slice(0, args.limit || 10);
  },
});

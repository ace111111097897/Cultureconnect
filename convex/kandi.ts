import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const KANDI_WELCOME_MESSAGE = `Woof! 🐾 Welcome to the Culture App, where your adventure into the rich tapestry of world cultures begins! I’m Kandi, your friendly AI dog and guide, excited to lead you through this amazing journey.

Get ready to unleash your curiosity! With engaging games, interactive quizzes, and fascinating cultural stories, there’s something in store for everyone! Whether you’re looking to test your knowledge, learn about traditions, or connect with fellow culture enthusiasts, you’ve come to the right place!

Here’s what you can look forward to:
🧩 Daily Quizzes and Games: Put your skills to the test and earn rewards along the way.
🌍 Cultural Adventures: Dive into unique stories and experiences from around the globe.
🐕 Community Fun: Join discussions, share experiences, and participate in exciting challenges with others who share your interests!

As a special welcome, we encourage you to start exploring right away! Click the link below to dive into your first quiz and see what surprises await you.

[Start Exploring Now!]

Thank you for joining us, and remember—Kandi is always here to help! Feel free to reply to this email if you have any questions or suggestions. Let’s make cultural exploration fun and engaging together!

Woofingly yours,
Kandi 🐶
Your Guide at Culture App`;

export const geminiChat = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (!GEMINI_API_KEY) {
      return { reply: "Gemini AI is not configured. Please set up the GEMINI_API_KEY." };
    }
    try {
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              { text: args.message }
            ]
          }
        ]
      };
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} - ${await response.text()}`);
      }
      const result = await response.json();
      const reply = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, Gemini could not generate a response.";
      return { reply };
    } catch (error) {
      console.error("Gemini AI error:", error);
      return { reply: "Sorry, Gemini is having technical difficulties right now. Try again later!" };
    }
  },
});

export const sendKandiWelcome = mutation({
  args: {
    userId: v.id("users"),
    displayName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Insert welcome message into kandiMessages
    await ctx.db.insert("kandiMessages", {
      userId: args.userId,
      userMessage: "",
      kandiResponse: KANDI_WELCOME_MESSAGE,
      timestamp: Date.now(),
    });
    // Send welcome email
    await ctx.scheduler.runAfter(0, internal.emailActions.sendWelcomeEmail, {
      email: args.email,
      displayName: args.displayName,
      // Optionally, you can add a custom subject or pass the message as a param
    });
    return null;
  },
});




import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

const OPENAI_API_KEY = process.env.CONVEX_OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.CONVEX_OPENAI_BASE_URL;

const KANDI_SYSTEM_PROMPT = "You are Kandi, a friendly and playful dog AI assistant for the Culture App. Respond as Kandi, never mention OpenAI or any other AI provider. Always use a warm, playful, and helpful tone.";

export const chatWithKandi = action({
  args: { message: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (!OPENAI_API_KEY || !OPENAI_BASE_URL) return { reply: "Kandi is not configured. Please try again later." };
    try {
      const response = await fetch(`${OPENAI_BASE_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: KANDI_SYSTEM_PROMPT },
            { role: "user", content: args.message }
          ],
          max_tokens: 256,
          temperature: 0.8
        })
      });
      if (!response.ok) throw new Error("Kandi is having trouble responding right now.");
      const result = await response.json();
      const reply = result.choices?.[0]?.message?.content || "Woof! Kandi didn't understand that. Try again!";
      return { reply };
    } catch (error) {
      return { reply: "Kandi is having technical difficulties. Please try again later!" };
    }
  }
});

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




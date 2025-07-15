import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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




import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

// Cache news data to prevent excessive API calls
let newsCache: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

export const getNews = query({
  args: {
    category: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Simple test version - just return fallback news
    return {
      success: true,
      news: getFallbackNews(),
      timestamp: Date.now(),
      source: "fallback"
    };
  },
});

// Fallback news data to prevent crashes
function getFallbackNews() {
  return [
    {
      title: "Cultural Exchange Programs Growing Worldwide",
      description: "More people are participating in cultural exchange programs, fostering global understanding and connections.",
      url: "#",
      published: new Date().toISOString(),
      source: "CultureConnect",
      image: null
    },
    {
      title: "International Food Festivals Bring Communities Together",
      description: "Food festivals around the world are becoming popular venues for cultural exchange and community building.",
      url: "#",
      published: new Date().toISOString(),
      source: "CultureConnect",
      image: null
    },
    {
      title: "Language Learning Apps See Surge in Popularity",
      description: "Digital platforms are making it easier than ever to learn new languages and connect with people globally.",
      url: "#",
      published: new Date().toISOString(),
      source: "CultureConnect",
      image: null
    },
    {
      title: "Virtual Cultural Events Gain Traction",
      description: "Online cultural events and workshops are helping people connect across borders and time zones.",
      url: "#",
      published: new Date().toISOString(),
      source: "CultureConnect",
      image: null
    },
    {
      title: "Global Music Collaborations on the Rise",
      description: "Musicians from different cultures are collaborating more than ever, creating unique fusion sounds.",
      url: "#",
      published: new Date().toISOString(),
      source: "CultureConnect",
      image: null
    },
    {
      title: "Cultural Tourism Rebounding Strongly",
      description: "Travelers are increasingly seeking authentic cultural experiences and local connections.",
      url: "#",
      published: new Date().toISOString(),
      source: "CultureConnect",
      image: null
    }
  ];
}

// Clear cache manually if needed
export const clearNewsCache = mutation({
  args: {},
  handler: async (ctx) => {
    newsCache = null;
    lastFetchTime = 0;
    return { success: true };
  },
});

// Simple test function to verify Convex is working
export const testNews = query({
  args: {},
  handler: async (ctx) => {
    return { message: "News module is working!", timestamp: Date.now() };
  },
});

// Gemini AI-powered news action
export const getAiNews = action({
  args: {},
  returns: v.array(
    v.object({
      title: v.string(),
      description: v.string(),
      url: v.string(),
      published: v.string(),
      source: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    // Use Gemini (Google Generative AI) to generate news headlines
    // You must install @google/generative-ai and set GEMINI_API_KEY in your environment
    // "use node"; // Uncomment if running in Node.js environment
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Give me 5 current world news headlines. For each, provide:\n- title\n- a 1-sentence description\n- a reputable source link\n- published date (ISO format)\n- source name\nRespond as a JSON array.`;

    const result = await model.generateContent(prompt);
    let news;
    try {
      news = JSON.parse(result.response.text());
    } catch (e) {
      throw new Error("Failed to parse Gemini response as JSON: " + result.response.text());
    }
    return news;
  },
}); 
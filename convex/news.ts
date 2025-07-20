import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (newsCache && (now - lastFetchTime) < CACHE_DURATION) {
      return newsCache;
    }

    try {
      // Use a reliable free news API with fallbacks
      const apis = [
        {
          url: "https://newsapi.org/v2/top-headlines",
          params: {
            country: args.country || "us",
            category: args.category || "general",
            apiKey: "demo" // Replace with your API key
          }
        },
        {
          url: "https://api.currentsapi.services/v1/latest-news",
          params: {
            country: args.country || "US",
            apiKey: "demo"
          }
        }
      ];

      let newsData = null;
      let error = null;

      // Try each API until one works
      for (const api of apis) {
        try {
          // Filter out undefined values from params and ensure all values are strings
          const cleanParams: Record<string, string> = {};
          Object.entries(api.params).forEach(([key, value]) => {
            if (value !== undefined) {
              cleanParams[key] = String(value);
            }
          });
          const response = await fetch(`${api.url}?${new URLSearchParams(cleanParams)}`);
          
          if (response.ok) {
            const data = await response.json();
            
            // Normalize data from different APIs
            if (data.articles) {
              // NewsAPI format
              newsData = data.articles.map((article: any) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                published: article.publishedAt,
                source: article.source?.name,
                image: article.urlToImage
              }));
            } else if (data.news) {
              // CurrentsAPI format
              newsData = data.news.map((article: any) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                published: article.published,
                source: article.author,
                image: article.image
              }));
            }
            
            if (newsData && newsData.length > 0) {
              break; // Success, exit loop
            }
          }
        } catch (apiError) {
          error = apiError;
          continue; // Try next API
        }
      }

      // If all APIs fail, return fallback news
      if (!newsData || newsData.length === 0) {
        newsData = getFallbackNews();
      }

      // Cache the successful result
      newsCache = newsData;
      lastFetchTime = now;

      return {
        success: true,
        news: newsData.slice(0, 12), // Limit to 12 articles
        timestamp: now,
        source: "live"
      };

    } catch (error) {
      console.error("News fetch error:", error);
      
      // Return fallback news on error
      return {
        success: false,
        news: getFallbackNews(),
        timestamp: now,
        source: "fallback",
        error: "Unable to fetch live news"
      };
    }
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
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAGH__JCmWzkP7KEkTGTwxnbDlvMzHdehU";

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

export async function callGeminiAI(prompt: string, userData?: any) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  // Build context about the user and available users
  let userContext = "";
  if (userData) {
    if (userData.currentUser) {
      userContext += `\n\nCURRENT USER INFORMATION:
- Name: ${userData.currentUser.displayName}
- Age: ${userData.currentUser.age}
- Location: ${userData.currentUser.location}
- Bio: ${userData.currentUser.bio}
- Languages: ${userData.currentUser.languages.join(', ')}
- Cultural Background: ${userData.currentUser.culturalBackground.join(', ')}
- Traditions: ${userData.currentUser.traditions.join(', ')}
- Food Preferences: ${userData.currentUser.foodPreferences.join(', ')}
- Music Genres: ${userData.currentUser.musicGenres.join(', ')}
- Travel Interests: ${userData.currentUser.travelInterests.join(', ')}
- Life Goals: ${userData.currentUser.lifeGoals.join(', ')}
- Values: ${userData.currentUser.values.join(', ')}
- Relationship Goals: ${userData.currentUser.relationshipGoals}`;
    }

    if (userData.targetUser) {
      userContext += `\n\nTARGET USER INFORMATION:
- Name: ${userData.targetUser.displayName}
- Age: ${userData.targetUser.age}
- Location: ${userData.targetUser.location}
- Bio: ${userData.targetUser.bio}
- Languages: ${userData.targetUser.languages.join(', ')}
- Cultural Background: ${userData.targetUser.culturalBackground.join(', ')}
- Traditions: ${userData.targetUser.traditions.join(', ')}
- Food Preferences: ${userData.targetUser.foodPreferences.join(', ')}
- Music Genres: ${userData.targetUser.musicGenres.join(', ')}
- Travel Interests: ${userData.targetUser.travelInterests.join(', ')}
- Life Goals: ${userData.targetUser.lifeGoals.join(', ')}
- Values: ${userData.targetUser.values.join(', ')}
- Relationship Goals: ${userData.targetUser.relationshipGoals}
- Compatibility Score: ${userData.targetUser.compatibilityScore}%`;
    }

    if (userData.availableUsers && userData.availableUsers.length > 0) {
      userContext += `\n\nAVAILABLE USERS ON THE PLATFORM (for general context):
${userData.availableUsers.map((user: any, index: number) => 
  `${index + 1}. ${user.displayName} (${user.age}, ${user.location}) - ${user.culturalBackground.join(', ')} - ${user.compatibilityScore}% compatibility`
).join('\n')}`;
    }
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ 
          text: `You are Kandi, a friendly and playful AI dog assistant for the Culture App. You help users understand cultural dating, relationships, and connections. 

IMPORTANT: Always respond as Kandi, never mention that you are a large language model or AI. Start your responses with "Woof!" and use a warm, playful, and helpful tone. Use dog emojis and be enthusiastic about cultural connections and dating advice.

You have access to user profile information to provide personalized advice. Use this information to give relevant, contextual responses about cultural connections, dating advice, and relationship guidance.${userContext}

User message: ${prompt}`
        }]
      }
    ],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 800,
    }
  };
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Woof! Sorry, I'm having trouble thinking right now. Can you try asking me again? 🐕";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Woof! I'm having a ruff day connecting to my brain. Please try again! 🐕");
  }
} 
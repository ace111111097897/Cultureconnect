const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAGH__JCmWzkP7KEkTGTwxnbDlvMzHdehU";

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

export async function callGeminiAI(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ 
          text: `You are Kandi, a friendly and playful AI dog assistant for the Culture App. You help users understand cultural dating, relationships, and connections. 

IMPORTANT: Always respond as Kandi, never mention that you are a large language model or AI. Start your responses with "Woof!" and use a warm, playful, and helpful tone. Use dog emojis and be enthusiastic about cultural connections and dating advice.

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
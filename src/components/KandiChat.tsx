import React, { useState, useEffect } from "react";
import { callGeminiAI } from "../lib/geminiApi";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

// Auto-generated question prompts for Kandi
const SUGGESTED_QUESTIONS = [
  "How can I start a conversation about cultural traditions?",
  "What are good questions to ask about someone's heritage?",
  "How do I show interest in someone's cultural background?",
  "What are some cultural dating tips?",
  "How can I plan a culturally-themed date?",
  "What should I know about cross-cultural relationships?",
  "How do I handle cultural differences in dating?",
  "What are good conversation starters for cultural topics?",
  "Tell me about users with similar cultural backgrounds",
  "What cultural activities would I enjoy based on my profile?"
];

export default function KandiChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "kandi",
      text: "Woof! Hi there! I'm Kandi, your friendly cultural dating assistant. I'm here to help you connect with amazing people through shared traditions and values. What would you like to chat about? 🌟"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  const getKandiUserData = useAction(api.ai.getKandiUserData);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getKandiUserData({});
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();
  }, [getKandiUserData]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;
    
    setMessages((msgs) => [...msgs, { from: "user", text: textToSend }]);
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      // Pass user data to Kandi for personalized responses
      const reply = await callGeminiAI(textToSend, userData);
      setMessages((msgs) => [...msgs, { from: "kandi", text: reply }]);
    } catch (err: any) {
      setError(err.message || "Error contacting Gemini AI");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const analyzeConversation = async () => {
    const analysisPrompt = `I want you to analyze a conversation I'm having with someone and give me advice on how to better connect with them. Can you help me understand their interests, communication style, and suggest topics to discuss?`;
    await sendMessage(analysisPrompt);
  };

  const askAboutUsers = async () => {
    const userPrompt = `Based on my profile and the available users on the platform, can you tell me about interesting people I might connect with? What cultural connections or shared interests might we have?`;
    await sendMessage(userPrompt);
  };

  return (
    <div className="flex flex-col items-center justify-start bg-gradient-to-br from-purple-800 via-blue-700 to-pink-500 rounded-2xl p-8 shadow-lg min-h-[60vh]">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-yellow-200 flex items-center justify-center mb-4 shadow-lg border-4 border-white">
          <span className="text-5xl">🐕</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Chat with Kandi</h2>
        <p className="text-lg text-white/80 mb-2">Your friendly AI companion for cultural dating advice!</p>
        {userData?.currentUser && (
          <p className="text-sm text-white/60">Connected as {userData.currentUser.displayName} from {userData.currentUser.location}</p>
        )}
      </div>

      {/* Suggested Questions */}
      {showSuggestions && (
        <div className="w-full max-w-2xl mb-6">
          <h3 className="text-white font-semibold mb-3">💡 Quick Questions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => sendMessage(question)}
                className="p-3 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition text-left"
              >
                {question}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={analyzeConversation}
              className="flex-1 p-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg text-white font-semibold hover:scale-105 transition"
            >
              🔍 Analyze My Conversation
            </button>
            <button
              onClick={askAboutUsers}
              className="flex-1 p-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg text-white font-semibold hover:scale-105 transition"
            >
              👥 Tell Me About Users
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl bg-white/10 rounded-xl p-6 mb-4 border border-white/20">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 p-4 rounded-lg ${msg.from === "kandi"
              ? "bg-gradient-to-br from-purple-400/60 to-pink-400/60 text-white border border-yellow-300"
              : "bg-white/80 text-black border border-gray-200"
              }`}
          >
            <div className="font-semibold mb-1 flex items-center">
              {msg.from === "kandi" && <span className="mr-2">🐕 Kandi</span>}
              {msg.from === "user" && <span className="mr-2">You</span>}
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
        {loading && <div className="text-white">🐕 Kandi is thinking...</div>}
        {error && <div className="text-red-500">{error}</div>}
      </div>

      <div className="w-full max-w-2xl flex">
        <input
          className="flex-1 border p-3 rounded-l-lg text-lg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask Kandi anything..."
          disabled={loading}
        />
        <button
          className="bg-yellow-300 text-black px-6 py-3 rounded-r-lg font-bold"
          onClick={() => sendMessage()}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
} 
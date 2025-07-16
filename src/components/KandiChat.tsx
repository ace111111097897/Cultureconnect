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
    <div className="flex flex-col items-center justify-start bg-gradient-to-br from-purple-800 via-blue-700 to-pink-500 rounded-2xl p-4 md:p-8 shadow-lg min-h-[60vh] md:min-h-[70vh]">
      <div className="flex flex-col items-center mb-6 md:mb-8">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-yellow-200 flex items-center justify-center mb-4 shadow-lg border-4 border-white">
          <span className="text-4xl md:text-5xl">🐕</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Chat with Kandi</h2>
        <p className="text-base md:text-lg text-white/80 mb-2 text-center">Your friendly AI companion for cultural dating advice!</p>
        {userData?.currentUser && (
          <p className="text-xs md:text-sm text-white/60 text-center">
            Connected as: {userData.currentUser.displayName || userData.currentUser.email}
          </p>
        )}
      </div>

      {/* Chat Messages */}
      <div className="w-full max-w-2xl mb-4 md:mb-6 flex-1 overflow-y-auto space-y-4 max-h-[40vh] md:max-h-[50vh]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 md:p-4 rounded-2xl ${
                message.sender === "user"
                  ? "bg-white text-gray-800 rounded-br-md"
                  : "bg-white/20 text-white rounded-bl-md"
              }`}
            >
              <p className="text-sm md:text-base whitespace-pre-wrap">{message.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/20 text-white rounded-2xl rounded-bl-md p-3 md:p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {showSuggestions && (
        <div className="w-full max-w-2xl mb-4 md:mb-6">
          <h3 className="text-white font-semibold mb-3">💡 Quick Questions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => sendMessage(question)}
                className="p-2 md:p-3 bg-white/10 rounded-lg text-white text-xs md:text-sm hover:bg-white/20 transition text-left"
              >
                {question}
              </button>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-2 mt-3">
            <button
              onClick={analyzeConversation}
              className="flex-1 p-2 md:p-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg text-white font-semibold hover:scale-105 transition text-sm md:text-base"
            >
              🔍 Analyze My Conversation
            </button>
            <button
              onClick={askAboutUsers}
              className="flex-1 p-2 md:p-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg text-white font-semibold hover:scale-105 transition text-sm md:text-base"
            >
              👥 Tell Me About Users
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl flex">
        <input
          className="flex-1 border p-2 md:p-3 rounded-l-lg text-base md:text-lg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask Kandi anything..."
          disabled={loading}
        />
        <button
          className="bg-yellow-300 text-black px-4 md:px-6 py-2 md:py-3 rounded-r-lg font-bold text-sm md:text-base"
          onClick={() => sendMessage()}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
} 
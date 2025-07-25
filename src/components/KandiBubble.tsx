import React, { useState, useEffect } from "react";
import { callGeminiAI } from "../lib/geminiApi";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

interface KandiBubbleProps {
  conversationHistory?: string;
  recipientName?: string;
  recipientUserId?: string;
  onClose?: () => void;
}

export default function KandiBubble({ conversationHistory, recipientName, recipientUserId, onClose }: KandiBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ from: "user" | "kandi"; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [searchedUser, setSearchedUser] = useState<any>(null);

  const getKandiUserData = useAction(api.ai.getKandiUserData);
  const getKandiUserByName = useAction(api.ai.getKandiUserByName);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getKandiUserData({ 
          targetUserId: recipientUserId 
        });
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();
  }, [getKandiUserData, recipientUserId]);

  const quickAdvice = userData?.culturalInsights?.icebreakers?.slice(0, 3) || [
    "Ask about their cultural background",
    "Share a cultural tradition",
    "Find common interests"
  ];

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;
    
    setMessages((msgs) => [...msgs, { from: "user", text: textToSend }]);
    setLoading(true);
    
    try {
      // Check if user is asking about a specific person
      const nameMatch = textToSend.match(/(?:tell me about|who is|what about|tell me more about)\s+([A-Za-z]+)/i);
      if (nameMatch) {
        const userName = nameMatch[1];
        const userInfo = await getKandiUserByName({ userName });
        
        if (userInfo.user) {
          setSearchedUser(userInfo);
          const userResponse = `🐕 Woof! I found ${userInfo.user.displayName} in your CultureConnect community! 

${userInfo.conversationAdvice.profileSummary}

${userInfo.conversationAdvice.interests}

${userInfo.conversationAdvice.values}

${userInfo.conversationAdvice.compatibility}

**Great conversation starters:**
${userInfo.conversationAdvice.conversationStarters.slice(0, 3).map((starter: string) => `• ${starter}`).join('\n')}

**Cultural questions to ask:**
${userInfo.conversationAdvice.culturalQuestions.slice(0, 2).map((question: string) => `• ${question}`).join('\n')}

Would you like me to help you start a conversation with ${userInfo.user.displayName}? 🐾`;
          
          setMessages((msgs) => [...msgs, { from: "kandi", text: userResponse }]);
        } else {
          setMessages((msgs) => [...msgs, { from: "kandi", text: `Woof! I couldn't find anyone named "${userName}" in your CultureConnect community. Maybe try a different name or check your Discover tab to see who's available! 🐕` }]);
        }
      } else {
        const contextPrompt = conversationHistory 
          ? `Context: You're helping me chat with ${recipientName || 'someone'}. Here's our conversation history: ${conversationHistory}. User question: ${textToSend}`
          : textToSend;
        
        // Pass user data to Kandi for personalized responses
        const reply = await callGeminiAI(contextPrompt, userData);
        setMessages((msgs) => [...msgs, { from: "kandi", text: reply }]);
      }
    } catch (err: any) {
      setMessages((msgs) => [...msgs, { from: "kandi", text: "Woof! I'm having trouble thinking right now. Can you try again? 🐕" }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const analyzeConversation = async () => {
    if (!conversationHistory) {
      await sendMessage("I want to analyze my conversation and get advice on how to better connect with this person. Can you help me understand their interests and suggest topics to discuss?");
      return;
    }
    
    const analysisPrompt = `Analyze this conversation with ${recipientName || 'someone'} and give me advice: ${conversationHistory}. What are their interests, communication style, and what topics should I discuss next?`;
    await sendMessage(analysisPrompt);
  };

  const getPersonalizedAdvice = async () => {
    if (userData?.culturalInsights) {
      const insights = userData.culturalInsights;
      const advicePrompt = `Based on our profiles, here's what I found:

Shared Interests: ${insights.sharedInterests.join(', ') || 'None yet'}
Cultural Connections: ${insights.culturalConnections.join(', ')}
Conversation Topics: ${insights.conversationTopics.slice(0, 3).join(', ')}

What specific advice can you give me for connecting with ${recipientName || 'this person'}?`;
      await sendMessage(advicePrompt);
    } else {
      await sendMessage("What are some good cultural conversation starters I can use?");
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full p-4 shadow-lg hover:scale-110 transition"
          title="Ask Kandi for advice"
        >
          <span className="text-2xl">🐕</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 w-80 bg-white rounded-lg shadow-xl border z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl mr-2">🐕</span>
          <span className="font-semibold">Kandi's Advice</span>
        </div>
        <button onClick={() => setIsExpanded(false)} className="text-white hover:text-gray-200">
          ✕
        </button>
      </div>

      {/* Quick Advice Buttons */}
      <div className="p-3 bg-gray-50">
        <div className="text-sm text-gray-600 mb-2">Quick advice for {recipientName || 'your chat'}:</div>
        <div className="flex flex-wrap gap-1">
          {quickAdvice.map((advice: string, index: number) => (
            <button
              key={index}
              onClick={() => sendMessage(advice)}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition"
            >
              {advice}
            </button>
          ))}
        </div>
        <div className="flex gap-1 mt-2">
          <button
            onClick={analyzeConversation}
            className="flex-1 p-2 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
          >
            🔍 Analyze
          </button>
          <button
            onClick={getPersonalizedAdvice}
            className="flex-1 p-2 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition"
          >
            💡 Personalized
          </button>
        </div>
        <div className="mt-2">
          <button
            onClick={() => sendMessage("Tell me about someone in my community")}
            className="w-full p-2 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition"
          >
            🐕 Ask about someone
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="h-64 overflow-y-auto p-3">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm text-center">
            Ask Kandi for advice about your conversation! 🐕
            {userData?.targetUser && (
              <div className="mt-2 text-xs text-blue-600">
                Connected with {userData.targetUser.displayName} ({userData.targetUser.compatibilityScore}% compatibility)
              </div>
            )}
            {userData?.culturalInsights?.sharedInterests?.length > 0 && (
              <div className="mt-2 text-xs text-green-600">
                🎯 Shared interests: {userData.culturalInsights.sharedInterests.slice(0, 2).join(', ')}
              </div>
            )}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.from === "kandi" ? "text-blue-600" : "text-gray-800"}`}>
            <div className="font-semibold text-xs">{msg.from === "kandi" ? "🐕 Kandi" : "You"}</div>
            <div className="text-sm">{msg.text}</div>
          </div>
        ))}
        {loading && <div className="text-blue-600 text-sm">🐕 Kandi is thinking...</div>}
      </div>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex">
          <input
            className="flex-1 border rounded-l px-2 py-1 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask Kandi..."
          />
          <button
            onClick={() => sendMessage()}
            className="bg-yellow-300 px-3 py-1 rounded-r text-sm font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
} 
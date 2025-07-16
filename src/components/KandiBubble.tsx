import React, { useState } from "react";
import { callGeminiAI } from "../lib/geminiApi";

interface KandiBubbleProps {
  conversationHistory?: string;
  recipientName?: string;
  onClose?: () => void;
}

export default function KandiBubble({ conversationHistory, recipientName, onClose }: KandiBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ from: "user" | "kandi"; text: string }>>([]);
  const [loading, setLoading] = useState(false);

  const quickAdvice = [
    "Ask about their cultural background",
    "Share a cultural tradition",
    "Plan a cultural date idea",
    "Find common interests",
    "Ask about their family traditions"
  ];

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;
    
    setMessages((msgs) => [...msgs, { from: "user", text: textToSend }]);
    setLoading(true);
    
    try {
      const contextPrompt = conversationHistory 
        ? `Context: You're helping me chat with ${recipientName || 'someone'}. Here's our conversation history: ${conversationHistory}. User question: ${textToSend}`
        : textToSend;
      
      const reply = await callGeminiAI(contextPrompt);
      setMessages((msgs) => [...msgs, { from: "kandi", text: reply }]);
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
          {quickAdvice.map((advice, index) => (
            <button
              key={index}
              onClick={() => sendMessage(advice)}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition"
            >
              {advice}
            </button>
          ))}
        </div>
        <button
          onClick={analyzeConversation}
          className="mt-2 w-full p-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
        >
          🔍 Analyze Conversation
        </button>
      </div>

      {/* Chat Area */}
      <div className="h-64 overflow-y-auto p-3">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm text-center">
            Ask Kandi for advice about your conversation! 🐕
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
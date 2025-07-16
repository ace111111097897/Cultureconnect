import React, { useState } from "react";
import { callKandiAI } from "../lib/kandiApi";

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

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { from: "user", text: input }]);
    setLoading(true);
    setError(null);
    try {
      const data = await callKandiAI(input);
      setMessages((msgs) => [...msgs, { from: "kandi", text: data.reply || JSON.stringify(data) }]);
    } catch (err: any) {
      setError(err.message || "Error contacting Kandi AI");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-start bg-gradient-to-br from-purple-800 via-blue-700 to-pink-500 rounded-2xl p-8 shadow-lg">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-yellow-200 flex items-center justify-center mb-4 shadow-lg border-4 border-white">
          <span className="text-5xl">🐕</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Chat with Kandi</h2>
        <p className="text-lg text-white/80 mb-2">Your friendly AI companion for cultural dating advice!</p>
      </div>
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
        {loading && <div className="text-white">Kandi is thinking...</div>}
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
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
} 
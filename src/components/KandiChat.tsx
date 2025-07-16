import React, { useState } from "react";
import { callKandiAI } from "../lib/kandiApi";

export default function KandiChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ from: "user" | "kandi"; text: string }[]>([]);
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
    <div className="fixed bottom-20 right-4 w-80 bg-white border rounded-lg shadow-lg p-4">
      <div className="max-h-60 overflow-y-auto mb-2">
        {messages.map((msg, i) => (
          <div key={i} className={msg.from === "kandi" ? "text-blue-600" : "text-gray-800"}>
            <b>{msg.from === "kandi" ? "Kandi: " : "You: "}</b>
            {msg.text}
          </div>
        ))}
        {loading && <div>Kandi is thinking...</div>}
        {error && <div className="text-red-500">{error}</div>}
      </div>
      <input
        className="border p-2 w-full"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Ask Kandi anything..."
        disabled={loading}
      />
      <button className="mt-2 w-full bg-yellow-300 rounded p-2" onClick={sendMessage} disabled={loading}>
        Send
      </button>
    </div>
  );
} 
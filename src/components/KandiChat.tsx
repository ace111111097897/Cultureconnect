import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export function KandiChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const kandiChat = useAction(api.kandi.kandiChat);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setError("");
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    try {
      const data = await kandiChat({ message: userMessage });
      setMessages((prev) => [...prev, { role: "kandi", text: data.reply }]);
    } catch (err) {
      setError("Sorry, Kandi is having trouble right now. Try again later!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-4 bg-white/10 rounded-2xl border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-4">Kandi AI Chat 🐶</h2>
      <div className="h-80 overflow-y-auto bg-white/5 rounded-xl p-3 mb-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span className={msg.role === "user" ? "bg-blue-500 text-white px-3 py-2 rounded-xl inline-block" : "bg-yellow-400/20 text-yellow-900 px-3 py-2 rounded-xl inline-block"}>
              {msg.role === "kandi" ? "🐶 Kandi: " : "You: "}{msg.text}
            </span>
          </div>
        ))}
        {isLoading && <div className="text-left text-yellow-500">Kandi is typing...</div>}
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={sendMessage} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none"
          placeholder="Ask Kandi anything..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold disabled:opacity-50"
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default KandiChat;

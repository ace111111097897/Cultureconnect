import { useState, useEffect, useRef } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const QUICK_PROMPTS = [
  "How do I start a conversation about my culture?",
  "What are some fun first date ideas?",
  "How can I share my traditions with someone new?",
  "What are good icebreakers for cultural dating?",
  "How do I talk about my family values?",
];

export function KandiChat() {
  const chatHistory = useQuery(api.kandi.getKandiChat, {});
  const addKandiMessage = useMutation(api.kandi.addKandiMessage);
  const chatWithKandi = useAction(api.kandi.chatWithKandi);

  const [userMessage, setUserMessage] = useState("");
  const [localChat, setLocalChat] = useState<Array<{ from: "user" | "kandi"; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // On load, sync local chat with backend
  useEffect(() => {
    if (chatHistory === undefined) return;
    setLocalChat(
      chatHistory.length > 0
        ? chatHistory.map((m: any) => ({ from: m.from, text: m.text }))
        : [
            {
              from: "kandi",
              text: "Woof! Hi there! I'm Kandi, your friendly cultural dating assistant. What would you like to chat about? 🌟",
            },
          ]
    );
  }, [chatHistory]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localChat, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userMessage.trim()) return;
    setError(null);
    setLoading(true);
    // Optimistically update UI
    setLocalChat((prev) => [...prev, { from: "user", text: userMessage }]);
    try {
      await addKandiMessage({ from: "user", text: userMessage });
      const response = await chatWithKandi({ prompt: userMessage });
      await addKandiMessage({ from: "kandi", text: response });
      setLocalChat((prev) => [...prev, { from: "kandi", text: response }]);
      setUserMessage("");
    } catch (err) {
      setError("Kandi is having a ruff day. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setUserMessage(prompt);
    setTimeout(() => handleSend(), 0);
  };

  return (
    <div className="max-w-lg mx-auto bg-white/10 rounded-xl shadow-lg p-0 mt-8 backdrop-blur-md flex flex-col h-[80vh]">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-500/60 to-purple-500/60 rounded-t-xl">
        <img src="https://cdn.pixabay.com/photo/2016/03/31/19/56/dog-1298135_1280.png" alt="Kandi avatar" className="w-10 h-10 rounded-full border-2 border-white bg-white/80" />
        <h2 className="text-2xl font-bold text-white">Kandi 🐕</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-black/60 to-black/80">
        {localChat.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            {msg.from === "kandi" && (
              <img src="https://cdn.pixabay.com/photo/2016/03/31/19/56/dog-1298135_1280.png" alt="Kandi avatar" className="w-8 h-8 rounded-full mr-2 self-end border border-white/30" />
            )}
            <div className={`rounded-2xl px-4 py-2 max-w-[70%] text-base shadow-md ${
              msg.from === "user"
                ? "bg-blue-500 text-white ml-8"
                : "bg-white/20 text-white mr-8"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2 max-w-[70%] text-base shadow-md bg-white/20 text-white mr-8 animate-pulse">
              Kandi is thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="px-4 py-3 border-t border-white/10 bg-black/40 rounded-b-xl">
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <textarea
            className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none min-h-[44px] max-h-32"
            rows={1}
            placeholder="Ask Kandi anything about cultural dating..."
            value={userMessage}
            onChange={e => setUserMessage(e.target.value)}
            disabled={loading}
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-6 rounded shadow hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
            disabled={loading || !userMessage.trim()}
          >
            Send
          </button>
        </form>
        {error && <div className="text-red-400 mt-2">{error}</div>}
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              className="bg-white/10 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-500/60 transition"
              onClick={() => handleQuickPrompt(prompt)}
              disabled={loading}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 
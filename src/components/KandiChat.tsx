import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export function KandiChat() {
  const [userMessage, setUserMessage] = useState("");
  const [kandiResponse, setKandiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatWithKandi = useAction(api.kandi.chatWithKandi);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setKandiResponse(null);
    try {
      const response = await chatWithKandi({ prompt: userMessage });
      setKandiResponse(response);
    } catch (err) {
      setError("Kandi is having a ruff day. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white/10 rounded-xl shadow-lg p-6 mt-8 backdrop-blur-md">
      <h2 className="text-2xl font-bold text-white mb-4">Chat with Kandi 🐕</h2>
      <form onSubmit={handleSend} className="flex flex-col gap-4">
        <textarea
          className="w-full p-3 rounded bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={3}
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
          {loading ? "Kandi is thinking..." : "Send"}
        </button>
      </form>
      {error && <div className="text-red-400 mt-2">{error}</div>}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm text-blue-200">Kandi</span>
          <span className="text-lg">🐕</span>
        </div>
        <div className="bg-white/20 rounded p-4 text-white min-h-[60px]">
          {kandiResponse
            ? kandiResponse
            : "Woof! Hi there! I'm Kandi, your friendly cultural dating assistant. What would you like to chat about? 🌟"}
        </div>
      </div>
    </div>
  );
} 
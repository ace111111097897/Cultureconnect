import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function KandiChat() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const chatHistory = useQuery(api.kandiQueries.getKandiHistory, { limit: 10 });
  const chatWithKandi = useAction(api.kandi.chatWithKandi);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      await chatWithKandi({ message: userMessage });
    } catch (error) {
      toast.error("Failed to send message to Kandi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto border-4 border-white/20">
          <span className="text-4xl">🐕</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Chat with Kandi</h2>
          <p className="text-white/70">Your friendly AI companion for cultural dating advice!</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col h-[600px]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Welcome message */}
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md">
              <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 text-white px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">🐕</span>
                  <span className="font-medium text-sm">Kandi</span>
                </div>
                <p>Woof! Hi there! I'm Kandi, your friendly cultural dating assistant. I'm here to help you connect with amazing people through shared traditions and values. What would you like to chat about? 🌟</p>
              </div>
            </div>
          </div>

          {/* Chat History */}
          {chatHistory?.slice().reverse().map((chat) => (
            <div key={chat._id} className="space-y-3">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-3 rounded-2xl rounded-br-md">
                    <p>{chat.userMessage}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(chat.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kandi Response */}
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 text-white px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">🐕</span>
                      <span className="font-medium text-sm">Kandi</span>
                    </div>
                    <p>{chat.kandiResponse}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(chat.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md">
                <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 text-white px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🐕</span>
                    <span className="font-medium text-sm">Kandi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="animate-bounce w-2 h-2 bg-white/60 rounded-full"></div>
                    <div className="animate-bounce w-2 h-2 bg-white/60 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                    <div className="animate-bounce w-2 h-2 bg-white/60 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Kandi anything about cultural dating..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              <span>🐕</span>
              <span>{isLoading ? "Sending..." : "Send"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Questions */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">💡 Quick Questions for Kandi</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            "How do I start a conversation about cultural traditions?",
            "What are good first date ideas for cultural connections?",
            "How can I share my heritage respectfully?",
            "Tips for long-distance cultural relationships?",
          ].map((question, index) => (
            <button
              key={index}
              onClick={() => setMessage(question)}
              className="text-left p-3 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-all text-sm"
              disabled={isLoading}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

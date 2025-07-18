import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { MessagingPrompts } from "./MessagingPrompts";
import KandiBubble from "./KandiBubble";
import { toast } from "sonner";

export function ConversationsSection({ initialConversationId }: { initialConversationId?: Id<"conversations"> }) {
  const [selectedConversation, setSelectedConversation] = useState<Id<"conversations"> | null>(initialConversationId || null);
  const [newMessage, setNewMessage] = useState("");
  const [showPrompts, setShowPrompts] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const conversations = useQuery(api.conversations.getUserConversations);
  const messages = useQuery(
    api.conversations.getConversationMessages,
    selectedConversation ? { conversationId: selectedConversation } : "skip"
  );
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);
  const matches = useQuery(api.matches.getUserMatches);
  const friends = useQuery(api.friends.getFriends);

  // Debug logging
  console.log("ConversationsSection - Conversations:", conversations);
  console.log("ConversationsSection - Selected Conversation:", selectedConversation);
  console.log("ConversationsSection - Initial Conversation ID:", initialConversationId);
  console.log("ConversationsSection - Messages:", messages);
  console.log("ConversationsSection - User Profile:", userProfile);

  // Auto-select conversation when initialConversationId is provided and conversations are loaded
  useEffect(() => {
    if (initialConversationId && conversations && !selectedConversation) {
      const conversationExists = conversations.find(c => c._id === initialConversationId);
      if (conversationExists) {
        setSelectedConversation(initialConversationId);
      }
    }
  }, [initialConversationId, conversations, selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX
    setIsSending(true);

    try {
      console.log("Sending message:", { conversationId: selectedConversation, content: messageContent });
      await sendMessage({
        conversationId: selectedConversation,
        content: messageContent,
      });
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(messageContent); // Restore the message if it failed
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectConversation = async (conversationId: Id<"conversations">) => {
    setSelectedConversation(conversationId);
    setShowPrompts(false);
    try {
      await markAsRead({ conversationId });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setNewMessage(prompt);
    setShowPrompts(false);
  };

  const getSelectedConversationData = () => {
    if (!selectedConversation || !conversations) return null;
    return conversations.find(c => c._id === selectedConversation);
  };

  if (!conversations) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-white mb-4">No conversations yet</h2>
          <p className="text-white/70">
            Start matching with people to begin meaningful conversations!
          </p>
        </div>
      </div>
    );
  }

  const selectedConversationData = getSelectedConversationData();

  // Get conversation history for Kandi
  const getConversationHistory = () => {
    if (!messages || !selectedConversationData) return "";
    return messages.map(msg => {
      const isOtherUser = msg.senderId === (selectedConversationData as any)?.otherProfile?.userId;
      const senderName = isOtherUser ? (selectedConversationData as any)?.otherProfile?.displayName : "You";
      return `${senderName}: ${msg.content}`;
    }).join("\n");
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 md:gap-6 h-[600px] md:h-[700px]">
      {/* Conversations List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-4 md:p-4 border-b border-white/20">
          <h3 className="text-base md:text-lg font-semibold text-white">Messages</h3>
        </div>
        
        <div className="overflow-y-auto h-full">
          {/* At the top of the Messages tab, show a list of matched and friended users: */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-2">Your Matches & Friends</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...(matches || []), ...(friends || [])].map((user, i) => (
                <div key={user._id || i} className="bg-white/10 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:scale-105 transition-all" onClick={() => handleSelectConversation(user.conversationId)}>
                  {user.otherProfile?.profileImageUrl ? (
                    <img src={user.otherProfile.profileImageUrl} alt={user.otherProfile.displayName} className="w-16 h-16 rounded-full object-cover mb-2" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2">
                      <span className="text-2xl text-white/60">👤</span>
                    </div>
                  )}
                  <div className="text-white font-semibold">{user.otherProfile?.displayName || user.displayName}</div>
                </div>
              ))}
            </div>
          </div>
          {conversations.map((conversation) => (
            <button
              key={conversation._id}
              onClick={() => handleSelectConversation(conversation._id)}
              className={`w-full p-4 md:p-4 text-left hover:bg-white/10 transition-all border-b border-white/10 ${
                selectedConversation === conversation._id ? 'bg-white/15' : ''
              }`}
            >
              <div className="flex items-center space-x-3 md:space-x-3">
                <div className="w-12 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {(conversation as any).otherProfile?.profileImageUrl ? (
                    <img
                      src={(conversation as any).otherProfile.profileImageUrl}
                      alt={(conversation as any).otherProfile.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">
                    {(conversation as any).otherProfile?.displayName || "Unknown User"}
                  </div>
                  <div className="text-white/70 text-sm truncate">
                    {conversation.lastMessage || "No messages yet"}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Messaging Prompts */}
            {showPrompts && selectedConversationData && userProfile && (
              <MessagingPrompts
                conversationId={selectedConversation}
                userProfile={userProfile}
                matchProfile={(selectedConversationData as any).otherProfile}
                onPromptSelect={handlePromptSelect}
              />
            )}

            {/* Chat Container */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col flex-1">
              {/* Chat Header */}
              <div className="p-4 md:p-4 border-b border-white/20 flex justify-between items-center">
                {(() => {
                  const conversation = conversations.find(c => c._id === selectedConversation);
                  const otherProfile = (conversation as any)?.otherProfile;
                  return otherProfile ? (
                    <div className="flex items-center space-x-3 md:space-x-3">
                      <div className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        {otherProfile.profileImageUrl ? (
                          <img
                            src={otherProfile.profileImageUrl}
                            alt={otherProfile.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm">👤</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{otherProfile.displayName}</div>
                        <div className="text-white/70 text-sm">Online</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white">Select a conversation</div>
                  );
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.senderId === userProfile?.userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.senderId === userProfile?.userId
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm md:text-base"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold hover:from-orange-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-white/70">Select a conversation to start chatting</p>
              <p className="text-white/50 text-sm mt-2">
                💡 Use our AI dog assistant for conversation starters!
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Kandi Bubble for real-time advice */}
      {selectedConversationData && (
        <KandiBubble
          conversationHistory={getConversationHistory()}
          recipientName={(selectedConversationData as any)?.otherProfile?.displayName}
          recipientUserId={(selectedConversationData as any)?.otherProfile?.userId}
        />
      )}
    </div>
  );
}

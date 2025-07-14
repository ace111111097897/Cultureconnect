import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { MessagingPrompts } from "./MessagingPrompts";
import React from "react";

interface ConversationsSectionProps {
  selectedConversationId?: string | null;
  setSelectedConversationId?: (id: string | null) => void;
}

export function ConversationsSection({ selectedConversationId, setSelectedConversationId }: ConversationsSectionProps = {}) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(selectedConversationId || null);
  const [newMessage, setNewMessage] = useState("");
  const [showPrompts, setShowPrompts] = useState(false);
  
  const conversations = useQuery(api.conversations.getUserConversations);
  const messages = useQuery(
    api.conversations.getConversationMessages,
    selectedConversation ? { conversationId: selectedConversation } : "skip"
  );
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);
  
  const sendMessage = useMutation(api.conversations.sendMessage);
  const markAsRead = useMutation(api.conversations.markMessagesAsRead);

  // Sync with prop if it changes
  React.useEffect(() => {
    if (selectedConversationId && selectedConversationId !== selectedConversation) {
      setSelectedConversation(selectedConversationId);
    }
  }, [selectedConversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage({
        conversationId: selectedConversation,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowPrompts(false);
    if (setSelectedConversationId) setSelectedConversationId(conversationId);
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

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[700px]">
      {/* Conversations List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white">Messages</h3>
        </div>
        
        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => (
            <button
              key={conversation._id}
              onClick={() => handleSelectConversation(conversation._id)}
              className={`w-full p-4 text-left hover:bg-white/10 transition-all border-b border-white/10 ${
                selectedConversation === conversation._id ? 'bg-white/15' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {(conversation as any).otherProfile?.profileImageUrl ? (
                    <img
                      src={(conversation as any).otherProfile.profileImageUrl}
                      alt={(conversation as any).otherProfile.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-lg">👤</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {(conversation as any).otherProfile?.displayName || 'Unknown'}
                  </p>
                  {conversation.lastMessage && (
                    <p className="text-white/60 text-sm truncate">
                      {conversation.lastMessage}
                    </p>
                  )}
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
              <div className="p-4 border-b border-white/20 flex justify-between items-center">
                {(() => {
                  const conversation = conversations.find(c => c._id === selectedConversation);
                  const otherProfile = (conversation as any)?.otherProfile;
                  return otherProfile ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        {otherProfile.profileImageUrl ? (
                          <img
                            src={otherProfile.profileImageUrl}
                            alt={otherProfile.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white">👤</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          {otherProfile.displayName}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {otherProfile.location}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}
                
                <button
                  onClick={() => setShowPrompts(!showPrompts)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center space-x-2"
                >
                  <span>🐕</span>
                  <span>{showPrompts ? "Hide" : "Get"} Prompts</span>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.senderId === (conversations.find(c => c._id === selectedConversation) as any)?.otherProfile?.userId
                        ? 'justify-start'
                        : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.senderId === (conversations.find(c => c._id === selectedConversation) as any)?.otherProfile?.userId
                          ? 'bg-white/20 text-white'
                          : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Send
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
    </div>
  );
}

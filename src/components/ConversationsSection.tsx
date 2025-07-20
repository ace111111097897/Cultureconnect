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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const conversations = useQuery(api.conversations.getUserConversations);
  const messages = useQuery(
    api.conversations.getConversationMessages,
    selectedConversation ? { conversationId: selectedConversation } : "skip"
  );
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);
  const matches = useQuery(api.matches.getUserMatches);
  const friends = useQuery(api.friends.getFriends);
  const sendMessage = useMutation(api.conversations.sendMessage);
  const markAsRead = useMutation(api.conversations.markAsRead);
  const createConversation = useMutation(api.conversations.createConversation);
  const createTestData = useMutation(api.profiles.createTestData);



  // Auto-select conversation when initialConversationId is provided and conversations are loaded
  useEffect(() => {
    if (
      initialConversationId &&
      conversations &&
      initialConversationId !== selectedConversation
    ) {
      const conversationExists = conversations.find(c => c._id === initialConversationId);
      if (conversationExists) {
        setSelectedConversation(initialConversationId);
      }
    }
  }, [initialConversationId, conversations, selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || (!selectedConversation && !selectedUser) || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX
    setIsSending(true);

    try {
      let conversationId = selectedConversation;
      
      // If we have a selected user but no conversation, create one
      if (selectedUser && !selectedConversation) {
        console.log("Creating conversation for user:", selectedUser.userId);
        conversationId = await createConversation({
          participantIds: [selectedUser.userId],
          type: "direct"
        });
        setSelectedConversation(conversationId);
      }

      if (conversationId) {
        console.log("Sending message:", { conversationId, content: messageContent });
        await sendMessage({
          conversationId,
          content: messageContent,
        });
        console.log("Message sent successfully");
      }
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
    setSelectedUser(null);
    setShowPrompts(false);
    try {
      await markAsRead({ conversationId });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user);
    setSelectedConversation(null);
    setShowPrompts(false);
    
    // Check if there's already a conversation with this user
    if (conversations) {
      const existingConversation = conversations.find(c => 
        c.type === "direct" && 
        c.participants.includes(user.userId)
      );
      
      if (existingConversation) {
        setSelectedConversation(existingConversation._id);
        setSelectedUser(null);
        try {
          await markAsRead({ conversationId: existingConversation._id });
        } catch (error) {
          console.error("Failed to mark messages as read:", error);
        }
      }
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setNewMessage(prompt);
    setShowPrompts(false);
  };

  const getSelectedConversationData = () => {
    if (selectedConversation && conversations) {
      return conversations.find(c => c._id === selectedConversation);
    }
    return null;
  };

  const getSelectedUserData = () => {
    return selectedUser;
  };

  // Combine all users (matches and friends) for display
  const getAllUsers = () => {
    const allUsers: any[] = [];
    
    // Add matches
    if (matches) {
      matches.forEach(match => {
        if (match && match.otherProfile) {
          allUsers.push({
            ...match.otherProfile,
            type: 'match',
            matchId: match._id
          });
        }
      });
    }
    
    // Add friends
    if (friends) {
      friends.forEach(friend => {
        if (friend) {
          allUsers.push({
            ...friend,
            type: 'friend'
          });
        }
      });
    }
    

    
    return allUsers;
  };

  // Check if a user has an existing conversation
  const getUserConversation = (userId: string) => {
    if (!conversations) return null;
    return conversations.find(c => 
      c.type === "direct" && 
      c.participants.includes(userId)
    );
  };

  // Show loading only if data is still loading
  if (matches === undefined || friends === undefined || userProfile === undefined) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
        <div className="text-white mt-4">Loading messages...</div>
      </div>
    );
  }

  const allUsers = getAllUsers();

  // Debug logging
  console.log("ConversationsSection - Conversations:", conversations);
  console.log("ConversationsSection - Matches:", matches);
  console.log("ConversationsSection - Friends:", friends);
  console.log("ConversationsSection - User Profile:", userProfile);
  console.log("ConversationsSection - Selected User:", selectedUser);
  console.log("ConversationsSection - All Users:", allUsers);

  // Always show the empty state for now to test
  return (
    <div className="text-center space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-2xl font-bold text-white mb-4">Messages</h2>
        <p className="text-white/70 mb-4">
          This area shows your friends and matches. Click on any person to start a conversation!
        </p>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">How it works:</h3>
          <ul className="text-white/70 text-left space-y-2">
            <li>• <strong>Friends:</strong> People you've added as friends will appear here</li>
            <li>• <strong>Matches:</strong> People you've matched with will appear here</li>
            <li>• <strong>Click any person</strong> to open a chat and start messaging</li>
            <li>• <strong>Real-time messaging</strong> with your connections</li>
          </ul>
        </div>
        <p className="text-white/50 text-sm mt-6">
          Go to Discover to find new people, or check your Matches tab to see who you've connected with!
        </p>
        <button
          onClick={async () => {
            try {
              const result = await createTestData();
              toast.success("Test data created! Check your Messages now.");
              console.log("Test data result:", result);
            } catch (error) {
              console.error("Error creating test data:", error);
              toast.error("Failed to create test data");
            }
          }}
          className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold hover:from-orange-500 hover:to-pink-600 transition-all"
        >
          Create Test Friends & Matches
        </button>
      </div>
    </div>
  );

  // Show empty state only if there are truly no users at all
  if (allUsers.length === 0) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-white mb-4">Messages</h2>
          <p className="text-white/70 mb-4">
            This area shows your friends and matches. Click on any person to start a conversation!
          </p>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">How it works:</h3>
            <ul className="text-white/70 text-left space-y-2">
              <li>• <strong>Friends:</strong> People you've added as friends will appear here</li>
              <li>• <strong>Matches:</strong> People you've matched with will appear here</li>
              <li>• <strong>Click any person</strong> to open a chat and start messaging</li>
              <li>• <strong>Real-time messaging</strong> with your connections</li>
            </ul>
          </div>
          <p className="text-white/50 text-sm mt-6">
            Go to Discover to find new people, or check your Matches tab to see who you've connected with!
          </p>
          <button
            onClick={async () => {
              try {
                const result = await createTestData();
                toast.success("Test data created! Check your Messages now.");
                console.log("Test data result:", result);
              } catch (error) {
                console.error("Error creating test data:", error);
                toast.error("Failed to create test data");
              }
            }}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold hover:from-orange-500 hover:to-pink-600 transition-all"
          >
            Create Test Friends & Matches
          </button>
        </div>
      </div>
    );
  }

  const selectedConversationData = getSelectedConversationData();
  const selectedUserData = getSelectedUserData();

  // Get conversation history for Kandi
  const getConversationHistory = () => {
    if (!messages || !selectedConversationData) return "";
    return messages.map(msg => {
      const isOtherUser = msg.senderId !== userProfile?.userId;
      const senderName = isOtherUser ? (selectedConversationData as any)?.otherProfile?.displayName || "Other" : "You";
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
          {allUsers.map((user, index) => {
            const existingConversation = getUserConversation(user.userId);
            const isSelected = selectedConversation === existingConversation?._id || 
                             (selectedUser && selectedUser.userId === user.userId);
            
            return (
              <button
                key={`${user.type}-${user.userId}-${index}`}
                onClick={() => existingConversation ? handleSelectConversation(existingConversation._id) : handleSelectUser(user)}
                className={`w-full p-4 md:p-4 text-left hover:bg-white/10 transition-all border-b border-white/10 ${
                  isSelected ? 'bg-white/15' : ''
                }`}
              >
                <div className="flex items-center space-x-3 md:space-x-3">
                  <div className="relative">
                    <div className="w-12 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={user.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm">👤</span>
                      )}
                    </div>
                    {/* Status indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div className="font-semibold text-white truncate">
                        {user.displayName}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.type === 'match' 
                          ? 'bg-orange-500/20 text-orange-300' 
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {user.type === 'match' ? 'Match' : 'Friend'}
                      </span>
                    </div>
                    <div className="text-white/70 text-sm truncate">
                      {existingConversation?.lastMessage || "Click to start chatting"}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2 flex flex-col">
        {(selectedConversation || selectedUser) ? (
          <>
            {/* Messaging Prompts */}
            {showPrompts && (selectedConversationData || selectedUserData) && userProfile && (
              <MessagingPrompts
                conversationId={selectedConversation || "new"}
                userProfile={userProfile}
                matchProfile={selectedConversationData?.otherProfile || selectedUserData}
                onPromptSelect={handlePromptSelect}
              />
            )}

            {/* Chat Container */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col flex-1">
              {/* Chat Header */}
              <div className="p-4 md:p-4 border-b border-white/20 flex justify-between items-center">
                {(() => {
                  const otherProfile = selectedConversationData?.otherProfile || selectedUserData;
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
                {selectedUser && messages?.length === 0 && (
                  <div className="text-center text-white/50 text-sm">
                    Start the conversation by sending a message!
                  </div>
                )}
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
      {(selectedConversationData || selectedUserData) && (
        <KandiBubble
          conversationHistory={getConversationHistory()}
          recipientName={(selectedConversationData as any)?.otherProfile?.displayName || selectedUserData?.displayName || "User"}
          recipientUserId={(selectedConversationData as any)?.otherProfile?.userId || selectedUserData?.userId || ""}
        />
      )}
    </div>
  );
}

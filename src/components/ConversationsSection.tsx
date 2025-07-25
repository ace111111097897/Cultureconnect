import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { MessagingPrompts } from "./MessagingPrompts";
import KandiBubble from "./KandiBubble";
import { toast } from "sonner";

// Profile Modal for chat header
function ProfileModalPopup({ profile, onClose, isFriend, isMatched, onAddFriend, onMatch }: {
  profile: any;
  onClose: () => void;
  isFriend: boolean;
  isMatched: boolean;
  onAddFriend: () => void;
  onMatch: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-3xl shadow-2xl p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto border-2 border-white/20">
        <button className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl" onClick={onClose}>✕</button>
        <div className="flex flex-col items-center">
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt={profile.displayName} className="w-24 h-24 rounded-full object-cover border-4 border-purple-400/40 shadow-xl mb-4" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-5xl text-white/60 border-4 border-purple-400/40 shadow-xl mb-4">👤</div>
          )}
          <div className="text-2xl font-bold text-white mb-2">{profile.displayName}, {profile.age}</div>
          <div className="text-white/80 mb-4">{profile.bio || "No bio yet."}</div>
          <div className="w-full space-y-2 mb-4">
            {profile.culturalBackground && profile.culturalBackground.length > 0 && (
              <div><span className="font-bold text-white">Culture:</span> <span className="text-white/80">{profile.culturalBackground.join(", ")}</span></div>
            )}
            {profile.languages && profile.languages.length > 0 && (
              <div><span className="font-bold text-white">Languages:</span> <span className="text-white/80">{profile.languages.join(", ")}</span></div>
            )}
            {profile.values && profile.values.length > 0 && (
              <div><span className="font-bold text-white">Values:</span> <span className="text-white/80">{profile.values.join(", ")}</span></div>
            )}
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={onAddFriend}
              disabled={isFriend}
              className={`px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all text-lg hover-scale ${isFriend ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isFriend ? 'Already Friends' : 'Add Friend'}
            </button>
            <button
              onClick={onMatch}
              disabled={isMatched}
              className={`px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all text-lg hover-scale ${isMatched ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isMatched ? 'Matched' : 'Match'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
  const createMatch = useMutation(api.matches.createMatch);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalProfile, setModalProfile] = useState<any>(null);

  // Play notification sound for new messages
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if audio fails
    } catch (e) {
      // Ignore audio errors
    }
  };

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
      c.participants.includes(userId as any)
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
  console.log("ConversationsSection - Component rendering...");



  // Show empty state only if there are truly no users at all
  if (allUsers.length === 0) {
    return (
      <div className="grid lg:grid-cols-3 gap-6 md:gap-6 h-[600px] md:h-[700px]">
        {/* Conversations List */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-4 md:p-4 border-b border-white/20">
            <h3 className="text-base md:text-lg font-semibold text-white">Messages</h3>
          </div>
          
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-white mb-3">No conversations yet</h3>
            <p className="text-white/70 mb-4">
              Start matching with people or adding friends to begin meaningful conversations!
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
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold hover:from-orange-500 hover:to-pink-600 transition-all"
            >
              Create Test Friends & Matches
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-white/70">Select a conversation to start chatting</p>
              <p className="text-white/50 text-sm mt-2">
                💡 Use our AI dog assistant for conversation starters!
              </p>
            </div>
          </div>
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

  console.log("ConversationsSection - About to render main interface");
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="grid lg:grid-cols-3 gap-6 md:gap-6 h-[600px] max-h-[600px]">
      {/* Conversations List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden h-[600px]">
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
      <div className="lg:col-span-2 flex flex-col h-[600px]">
        {/* Chat Container */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col h-full">
          {/* Chat Header - Fixed at top */}
          <div className="p-4 md:p-4 border-b border-white/20 flex justify-between items-center flex-shrink-0">
            {(() => {
              const otherProfile = (selectedConversationData as any)?.otherProfile || selectedUserData;
              return otherProfile ? (
                <div className="flex items-center space-x-3 md:space-x-3 cursor-pointer group" onClick={() => { setModalProfile(otherProfile); setShowProfileModal(true); }}>
                  <div className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center group-hover:ring-2 group-hover:ring-pink-400 transition-all">
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
                    <div className="font-semibold text-white group-hover:underline">{otherProfile.displayName}</div>
                    <div className="text-white/70 text-sm">Online</div>
                  </div>
                </div>
              ) : (
                <div className="text-white font-semibold">Messages</div>
              );
            })()}
          </div>

          {/* Messages - Scrollable area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages?.map((message, index) => {
              const isMe = message.senderId === userProfile?.userId;
              const date = message.timestamp ? new Date(message.timestamp) : null;
              const formatted = date ? date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
              return (
                <div
                  key={index}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%]`}>
                    <div
                      className={`p-3 rounded-2xl ${
                        isMe
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {message.content}
                    </div>
                    {formatted && (
                      <div className={`text-xs text-white/60 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>{formatted}</div>
                    )}
                  </div>
                </div>
              );
            })}
            {selectedUser && messages?.length === 0 && (
              <div className="text-center text-white/50 text-sm">
                Start the conversation by sending a message!
              </div>
            )}
            {!selectedConversation && !selectedUser && (
              <div className="text-center text-white/50 text-sm">
                Select a friend or match from the list to start chatting
              </div>
            )}
          </div>

          {/* Message Input - Fixed at bottom */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20 flex-shrink-0">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={selectedConversation || selectedUser ? "Type a message..." : "Select someone to chat with..."}
                disabled={!selectedConversation && !selectedUser}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm md:text-base disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending || (!selectedConversation && !selectedUser)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold hover:from-orange-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
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
      {/* Profile Modal Popup */}
      {showProfileModal && modalProfile && (
        <ProfileModalPopup
          profile={modalProfile}
          onClose={() => setShowProfileModal(false)}
          isFriend={!!(friends && friends.some((f: any) => f.userId === modalProfile.userId))}
          isMatched={!!(matches && matches.some((m: any) => (m.user1Id === modalProfile.userId || m.user2Id === modalProfile.userId)))}
          onAddFriend={async () => {
            try {
              await sendFriendRequest({ toUserId: modalProfile.userId });
              toast.success('Friend request sent!');
            } catch (e: any) {
              toast.error(e?.message || 'Failed to send friend request.');
            }
          }}
          onMatch={async () => {
            try {
              await createMatch({ targetUserId: modalProfile.userId, interactionType: 'like' });
              toast.success('You liked this user!');
            } catch (e: any) {
              toast.error(e?.message || 'Failed to like.');
            }
          }}
        />
      )}
    </div>
  );
}

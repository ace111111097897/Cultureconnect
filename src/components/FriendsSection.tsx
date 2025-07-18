import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function FriendsSection({ 
  onNavigateToConversation, 
  onNavigateToTab 
}: { 
  onNavigateToConversation?: (conversationId: any) => void;
  onNavigateToTab?: (tab: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewRequestNotification, setShowNewRequestNotification] = useState(false);
  const [lastRequestCount, setLastRequestCount] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  // Add state for message prompt/modal
  const [showMessagePrompt, setShowMessagePrompt] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  
  const friends = useQuery(api.friends.getFriends);
  const friendRequests = useQuery(api.friends.getFriendRequests);
  const conversations = useQuery(api.conversations.getUserConversations);
  const currentUserProfile = useQuery(api.profiles.getCurrentUserProfile);
  const respondToRequest = useMutation(api.friends.respondToFriendRequest);
  const createConversation = useMutation(api.conversations.createConversation);

  // Debug logging
  console.log("FriendsSection - Friends:", friends);
  console.log("FriendsSection - Friend Requests:", friendRequests);
  console.log("FriendsSection - Conversations:", conversations);
  console.log("FriendsSection - Current User Profile:", currentUserProfile);

  // Check for new friend requests and show notification
  useEffect(() => {
    if (friendRequests && friendRequests.length > lastRequestCount && lastRequestCount > 0) {
      setShowNewRequestNotification(true);
      
      // Play notification sound (if supported)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors if audio fails
      } catch (e) {
        // Ignore audio errors
      }
      
      toast.success(`You have ${friendRequests.length - lastRequestCount} new friend request${friendRequests.length - lastRequestCount > 1 ? 's' : ''}!`, {
        duration: 4000,
        action: {
          label: 'View',
          onClick: () => setActiveTab("requests")
        }
      });
      
      // Auto-hide notification after 8 seconds
      setTimeout(() => setShowNewRequestNotification(false), 8000);
    }
    setLastRequestCount(friendRequests?.length || 0);
  }, [friendRequests, lastRequestCount]);

  // Filter friends based on search query
  const filteredFriends = friends?.filter(friend => 
    friend?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend?.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend?.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend?.culturalBackground?.some((bg: string) => 
      bg.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  const handleRespondToRequest = async (requestId: string, response: "accepted" | "rejected") => {
    try {
      await respondToRequest({ requestId: requestId as any, response });
      toast.success(response === "accepted" ? "Friend request accepted!" : "Friend request declined");
    } catch (error) {
      toast.error("Failed to respond to friend request");
      console.error(error);
    }
  };

  const handleMessage = async (friend: any) => {
    if (!conversations || !currentUserProfile) return;
    // Try to find an existing conversation
    let conversation = conversations.find((conv: any) => {
      const otherProfile = conv.otherProfile;
      return otherProfile && (otherProfile.userId === friend.userId || otherProfile._id === friend._id);
    });
    if (!conversation) {
      // Create a new conversation
      try {
        const newConversationId = await createConversation({
          participantIds: [currentUserProfile.userId, friend.userId],
          type: "direct"
        });
        if (onNavigateToConversation && onNavigateToTab) {
          onNavigateToConversation(newConversationId);
          onNavigateToTab("conversations");
        }
        return;
    } catch (error) {
        toast.error("Failed to create conversation");
        return;
      }
    }
    // Open the existing conversation
    if (onNavigateToConversation && onNavigateToTab) {
      onNavigateToConversation(conversation._id);
      onNavigateToTab("conversations");
    }
  };

  const handleViewProfile = (friend: any) => {
    setSelectedProfile(friend);
    setShowProfileModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Floating New Request Notification */}
      {showNewRequestNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg border border-white/20 backdrop-blur-md animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="text-xl animate-pulse">📨</span>
              <span className="font-semibold">New friend request!</span>
              <button 
                onClick={() => {
                  setShowNewRequestNotification(false);
                  setActiveTab("requests");
                }}
                className="ml-2 px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-all font-medium"
              >
                View
              </button>
              <button 
                onClick={() => setShowNewRequestNotification(false)}
                className="ml-1 px-2 py-1 bg-white/10 rounded-full text-xs hover:bg-white/20 transition-all"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === "friends"
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Friends
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === "requests"
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Requests
              {friendRequests && friendRequests.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {friendRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar - Only show for friends tab */}
      {activeTab === "friends" && (
        <div className="max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-white/50">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search friends by name, bio, location, or culture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Friends Tab */}
      {activeTab === "friends" ? (
        <div>
          {friends === undefined ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
            </div>
          ) : friends === null ? (
            <div className="text-center space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-white mb-4">Error loading friends</h3>
                <p className="text-white/70">
                  There was an issue loading your friends. Please refresh the page.
                </p>
              </div>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-2xl font-bold text-white mb-4">No friends yet</h3>
                <p className="text-white/70">
                  Start connecting with people to build your friend network!
                </p>
              </div>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-4">No friends found</h3>
                <p className="text-white/70">
                  Try adjusting your search terms to find your friends.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFriends.map((friend) => (
                <div
                  key={friend!._id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      {friend!.profileImageUrl ? (
                        <img
                          src={friend!.profileImageUrl}
                          alt={friend!.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xl">👤</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {friend!.displayName}
                      </h3>
                      <p className="text-white/70 text-sm">{friend!.location}</p>
                    </div>
                  </div>
                  
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">
                    {friend!.bio}
                  </p>
                  
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all"
                      onClick={() => handleMessage(friend)}
                    >
                      Message
                    </button>
                    <button 
                      onClick={() => handleViewProfile(friend)}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-all"
                    >
                      Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Requests Tab */
        <div className="space-y-4">
          {friendRequests === undefined ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
            </div>
          ) : friendRequests === null ? (
            <div className="text-center space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-white mb-4">Error loading requests</h3>
                <p className="text-white/70">
                  There was an issue loading friend requests. Please refresh the page.
                </p>
              </div>
            </div>
          ) : friendRequests.length === 0 ? (
            <div className="text-center space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
                <div className="text-6xl mb-4">📨</div>
                <h3 className="text-2xl font-bold text-white mb-4">No friend requests</h3>
                <p className="text-white/70">
                  When people send you friend requests, they'll appear here!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {friendRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        {request.senderProfile?.profileImageUrl ? (
                          <img
                            src={request.senderProfile.profileImageUrl}
                            alt={request.senderProfile.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-lg">👤</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {request.senderProfile?.displayName}
                        </h3>
                        <p className="text-white/70 text-sm">
                          {request.senderProfile?.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRespondToRequest(request._id, "accepted")}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondToRequest(request._id, "rejected")}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            {/* Header */}
            <div className="p-6 border-b border-white/20 flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {selectedProfile.profileImageUrl ? (
                    <img
                      src={selectedProfile.profileImageUrl}
                      alt={selectedProfile.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-3xl">👤</span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedProfile.displayName}
                  </h2>
                  <p className="text-white/70">{selectedProfile.location}</p>
                  {selectedProfile.age && (
                    <p className="text-white/50 text-sm">{selectedProfile.age} years old</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-all"
              >
                <span className="text-white text-2xl">✕</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Bio */}
              {selectedProfile.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                  <p className="text-white/80 leading-relaxed">{selectedProfile.bio}</p>
                </div>
              )}

              {/* Cultural Background */}
              {selectedProfile.culturalBackground && selectedProfile.culturalBackground.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>🌍</span> Cultural Background
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.culturalBackground.map((bg: string) => (
                      <span key={bg} className="bg-white/10 text-white px-3 py-1 rounded-full text-sm border border-white/20">
                        {bg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {selectedProfile.languages && selectedProfile.languages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>🗣️</span> Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.languages.map((lang: string) => (
                      <span key={lang} className="bg-green-500/20 text-green-100 px-3 py-1 rounded-full text-sm border border-green-400/30">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Values */}
              {selectedProfile.values && selectedProfile.values.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>💡</span> Values
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.values.map((value: string) => (
                      <span key={value} className="bg-blue-500/20 text-blue-100 px-3 py-1 rounded-full text-sm border border-blue-400/30">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Food Preferences */}
              {selectedProfile.foodPreferences && selectedProfile.foodPreferences.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>🍽️</span> Food Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.foodPreferences.map((food: string) => (
                      <span key={food} className="bg-pink-500/20 text-pink-100 px-3 py-1 rounded-full text-sm border border-pink-400/30">
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Traditions */}
              {selectedProfile.traditions && selectedProfile.traditions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>🎭</span> Traditions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.traditions.map((tradition: string) => (
                      <span key={tradition} className="bg-purple-500/20 text-purple-100 px-3 py-1 rounded-full text-sm border border-purple-400/30">
                        {tradition}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Music Genres */}
              {selectedProfile.musicGenres && selectedProfile.musicGenres.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>🎵</span> Music
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.musicGenres.map((music: string) => (
                      <span key={music} className="bg-orange-500/20 text-orange-100 px-3 py-1 rounded-full text-sm border border-orange-400/30">
                        {music}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Travel Interests */}
              {selectedProfile.travelInterests && selectedProfile.travelInterests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>✈️</span> Travel Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.travelInterests.map((travel: string) => (
                      <span key={travel} className="bg-cyan-500/20 text-cyan-100 px-3 py-1 rounded-full text-sm border border-cyan-400/30">
                        {travel}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Life Goals */}
              {selectedProfile.lifeGoals && selectedProfile.lifeGoals.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>🎯</span> Life Goals
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.lifeGoals.map((goal: string) => (
                      <span key={goal} className="bg-yellow-500/20 text-yellow-100 px-3 py-1 rounded-full text-sm border border-yellow-400/30">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Relationship Goals */}
              {selectedProfile.relationshipGoals && (
              <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>💕</span> Relationship Goals
                  </h3>
                  <p className="text-white/80 bg-white/5 p-3 rounded-lg border border-white/10">
                    {selectedProfile.relationshipGoals}
                  </p>
                </div>
              )}
              </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/20 flex space-x-3">
                <button
                onClick={() => {
                  setShowProfileModal(false);
                  handleMessage(selectedProfile);
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                Message
                </button>
                <button
                onClick={() => setShowProfileModal(false)}
                className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
                >
                Close
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Prompt Modal */}
      {showMessagePrompt && selectedFriend && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Send Message</h3>
              <button
                onClick={() => setShowMessagePrompt(false)}
                className="text-white/70 hover:text-white text-2xl"
              >✕</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {selectedFriend.profileImageUrl ? (
                    <img src={selectedFriend.profileImageUrl} alt={selectedFriend.displayName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white text-sm">👤</span>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedFriend.displayName}</p>
                  <p className="text-white/60 text-sm">{selectedFriend.location}</p>
                </div>
              </div>
              <textarea
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 h-32"
                placeholder="Write a message to start a conversation..."
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMessagePrompt(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
                >Cancel</button>
                <button
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all"
                >Send Message</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

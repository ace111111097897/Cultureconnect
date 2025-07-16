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
  
  const friends = useQuery(api.friends.getFriends);
  const friendRequests = useQuery(api.friends.getFriendRequests);
  const conversations = useQuery(api.conversations.getUserConversations);
  const respondToRequest = useMutation(api.friends.respondToFriendRequest);

  // Debug logging
  console.log("FriendsSection - Friends:", friends);
  console.log("FriendsSection - Friend Requests:", friendRequests);

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
    if (!conversations || !onNavigateToConversation || !onNavigateToTab) {
      toast.error("Unable to open conversation");
      return;
    }

    // Find the conversation with this friend
    const conversation = conversations.find(conv => {
      const otherProfile = (conv as any)?.otherProfile;
      return otherProfile && otherProfile.userId === friend.userId;
    });

    if (conversation) {
      // Navigate to conversations tab and open this conversation
      onNavigateToConversation(conversation._id);
      onNavigateToTab("conversations");
      toast.success(`Opening conversation with ${friend.displayName}`);
    } else {
      toast.error("No conversation found with this friend");
    }
  };

  const handleViewProfile = (friend: any) => {
    // Navigate to friend's profile
    toast.info(`Viewing ${friend.displayName}'s profile...`);
    // You could add navigation logic here
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
          {!friends ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
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
                      onClick={() => handleMessage(friend)}
                      className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all"
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
          {!friendRequests ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
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
    </div>
  );
}

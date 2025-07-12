import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function FriendsSection() {
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  
  const friends = useQuery(api.friends.getFriends);
  const friendRequests = useQuery(api.friends.getFriendRequests);
  const respondToRequest = useMutation(api.friends.respondToFriendRequest);

  const handleRespondToRequest = async (requestId: string, response: "accepted" | "rejected") => {
    try {
      await respondToRequest({ requestId: requestId as any, response });
      toast.success(response === "accepted" ? "Friend request accepted!" : "Friend request declined");
    } catch (error) {
      toast.error("Failed to respond to friend request");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Friends</h2>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "friends"
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Friends ({friends?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 rounded-lg font-medium transition-all relative ${
                activeTab === "requests"
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Requests
              {friendRequests && friendRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {friendRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
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
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map((friend) => (
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
                    <button className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all">
                      Message
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-all">
                      Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {!friendRequests ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
            </div>
          ) : friendRequests.length === 0 ? (
            <div className="text-center space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
                <div className="text-6xl mb-4">📬</div>
                <h3 className="text-2xl font-bold text-white mb-4">No friend requests</h3>
                <p className="text-white/70">
                  When someone sends you a friend request, it will appear here.
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
                          <span className="text-white">👤</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {request.senderProfile?.displayName || 'Unknown User'}
                        </h3>
                        <p className="text-white/70 text-sm">
                          Sent {new Date(request.timestamp).toLocaleDateString()}
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
                        className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-red-500/20 hover:border-red-400/30 transition-all"
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

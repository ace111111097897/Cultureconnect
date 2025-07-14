import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function FriendsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  
  const friends = useQuery(api.friends.getFriends);
  const friendRequests = useQuery(api.friends.getFriendRequests);
  const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest);
  const rejectFriendRequest = useMutation(api.friends.rejectFriendRequest);

  const handleAcceptRequest = async (requestId: any) => {
    try {
      await acceptFriendRequest({ requestId });
      toast.success("Friend request accepted! 🎉");
    } catch (error) {
      toast.error("Failed to accept friend request");
    }
  };

  const handleRejectRequest = async (requestId: any) => {
    try {
      await rejectFriendRequest({ requestId });
      toast.success("Friend request declined");
    } catch (error) {
      toast.error("Failed to reject friend request");
    }
  };

  const filteredFriends = friends?.filter(friend =>
    friend?.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a?.displayName.localeCompare(b?.displayName || '') || 0);

  const pendingRequests = friendRequests?.filter(req => req.status === "pending") || [];

  if (selectedFriend) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-0">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedFriend(null)}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-all"
            >
              <span>←</span>
              <span>Back to Friends</span>
            </button>
          </div>

          {/* Friend Profile View */}
          <div className="text-center space-y-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto overflow-hidden">
              {selectedFriend.profileImageUrl ? (
                <img
                  src={selectedFriend.profileImageUrl}
                  alt={selectedFriend.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-4xl">👤</span>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">{selectedFriend.displayName}</h1>
              <p className="text-white/70 text-lg">{selectedFriend.age} • {selectedFriend.location}</p>
              <p className="text-white/80 mt-3 max-w-2xl mx-auto">{selectedFriend.bio}</p>
            </div>

            {/* Cultural Information */}
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white/80 font-medium mb-3">🌍 Cultural Background</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFriend.culturalBackground?.slice(0, 3).map((bg: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm">
                      {bg}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white/80 font-medium mb-3">🗣️ Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFriend.languages?.slice(0, 3).map((lang: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white/80 font-medium mb-3">💫 Values</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFriend.values?.slice(0, 3).map((value: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm">
                      {value}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white/80 font-medium mb-3">🍽️ Food Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFriend.foodPreferences?.slice(0, 3).map((food: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-orange-500/20 text-orange-200 rounded-full text-sm">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all">
              Send Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">👥 Your Cultural Friends</h1>
        <p className="text-white/70">Connect with friends who share your cultural interests</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search friends by name..."
            className="w-full px-4 py-3 pl-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">🔍</span>
        </div>
      </div>

      {/* Friend Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">📬</span>
            Friend Requests
            <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-sm rounded-full">
              {pendingRequests.length}
            </span>
          </h2>
          
          <div className="space-y-4">
            {pendingRequests.map(request => (
              <div key={request._id} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-lg">👤</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{request.fromUser?.displayName}</h3>
                    <p className="text-white/60 text-sm">{request.fromUser?.location}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptRequest(request._id)}
                    className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request._id)}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6">Your Friends ({filteredFriends?.length || 0})</h2>
        
        {!filteredFriends || filteredFriends.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">No friends yet</h3>
            <p className="text-white/70">
              {searchTerm ? "No friends match your search." : "Start connecting with people in the Discover section!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map(friend => friend && (
              <div
                key={friend._id}
                onClick={() => setSelectedFriend(friend)}
                className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                    {friend.profileImageUrl ? (
                      <img
                        src={friend.profileImageUrl}
                        alt={friend.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xl">👤</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{friend.displayName}</h3>
                    <p className="text-white/60 text-sm">{friend.location}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {friend.culturalBackground?.slice(0, 2).map((bg: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded-full text-xs">
                          {bg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

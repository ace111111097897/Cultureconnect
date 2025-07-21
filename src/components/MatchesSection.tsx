import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
// import MatchPercentage from "./MatchPercentage";

// Add prop types for navigation
type MatchesSectionProps = {
  onNavigateToConversation?: (conversationId: string) => void;
  onNavigateToTab?: (tab: string) => void;
};

const useLikedMatches = () => {
  const [liked, setLiked] = useState<{ [userId: string]: boolean }>({});
  const markLiked = (userId: string) => setLiked(prev => ({ ...prev, [userId]: true }));
  return { liked, markLiked };
};

const useSuperLike = (maxPerDay = 10) => {
  const [superLiked, setSuperLiked] = useState<{ [userId: string]: boolean }>({});
  const [count, setCount] = useState(0);
  const [resetTime, setResetTime] = useState<number>(() => {
    const stored = localStorage.getItem('superLikeResetTime');
    return stored ? parseInt(stored) : 0;
  });
  useEffect(() => {
    const now = Date.now();
    if (resetTime && now > resetTime) {
      setCount(0);
      setSuperLiked({});
      localStorage.setItem('superLikeCount', '0');
      localStorage.setItem('superLikeResetTime', (now + 24 * 60 * 60 * 1000).toString());
      setResetTime(now + 24 * 60 * 60 * 1000);
    }
  }, [resetTime]);
  useEffect(() => {
    const storedCount = localStorage.getItem('superLikeCount');
    if (storedCount) setCount(parseInt(storedCount));
  }, []);
  const canSuperLike = count < maxPerDay;
  const markSuperLiked = (userId: string) => {
    setSuperLiked(prev => ({ ...prev, [userId]: true }));
    setCount(c => {
      const newCount = c + 1;
      localStorage.setItem('superLikeCount', newCount.toString());
      if (!resetTime) {
        const nextReset = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('superLikeResetTime', nextReset.toString());
        setResetTime(nextReset);
      }
      return newCount;
    });
  };
  return { superLiked, canSuperLike, markSuperLiked, count, maxPerDay, resetTime };
};

export function MatchesSection(props: MatchesSectionProps) {
  const [showMessagePrompt, setShowMessagePrompt] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [messagePrompt, setMessagePrompt] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<{ [userId: string]: boolean }>({});

  const matches = useQuery(api.matches.getUserMatches);
  const getUserConversations = useQuery(api.conversations.getUserConversations);
  const sendMessage = useMutation(api.conversations.sendMessage);
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
  const friends = useQuery(api.friends.getFriends);
  const friendRequests = useQuery(api.friends.getFriendRequests);
  const createMatch = useMutation(api.matches.createMatch);
  const createConversation = useMutation(api.conversations.createConversation);
  const { liked, markLiked } = useLikedMatches();
  const { superLiked, canSuperLike, markSuperLiked, count, maxPerDay, resetTime } = useSuperLike();

  const handleMessage = async (match: any) => {
    // Check if there's already a conversation
    const existingConversation = getUserConversations?.find(conv => 
      conv.participants.includes(match.otherProfile.userId)
    );

    if (existingConversation) {
      // Navigate to existing conversation
      toast.info("Opening existing conversation...");
      // You could add navigation logic here to switch to conversations tab
    } else {
      // Show message prompt
      setSelectedMatch(match);
      setShowMessagePrompt(true);
    }
  };

  const handleAddFriend = async (match: any) => {
    const userId = match.otherProfile.userId;
    if (pendingRequests[userId]) return;
    setPendingRequests(prev => ({ ...prev, [userId]: true }));
    try {
      await sendFriendRequest({ toUserId: userId });
      toast.success(`Friend request sent to ${match.otherProfile.displayName}!`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to send friend request.");
    } finally {
      setPendingRequests(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Helper to get friend request status for a user
  const getFriendStatus = (userId: string) => {
    if (friends && friends.some((f: any) => f.userId === userId)) {
      return "friend";
    }
    if (friendRequests && friendRequests.some((r: any) => r.fromUserId === userId || r.toUserId === userId)) {
      // If the current user sent the request, it's pending
      const outgoing = friendRequests.find((r: any) => r.toUserId === userId);
      if (outgoing) return "pending";
      // If the current user received the request, it's also pending
      const incoming = friendRequests.find((r: any) => r.fromUserId === userId);
      if (incoming) return "requested_you";
    }
    return "none";
  };

  const handleSendMessage = async () => {
    if (!selectedMatch || !messagePrompt.trim()) return;
    try {
      // Check if there's already a conversation
      const existingConversation = getUserConversations?.find(conv => 
        conv.participants.includes(selectedMatch.otherProfile.userId)
      );
      let conversationId = existingConversation?._id;
      if (!conversationId) {
        // Create a new conversation
        conversationId = await createConversation({
          participantIds: [selectedMatch.otherProfile.userId],
          type: "direct"
        });
      }
      // Send the message
      await sendMessage({ conversationId, content: messagePrompt });
      toast.success("Message sent!");
      setShowMessagePrompt(false);
      setMessagePrompt("");
      // Navigate to Conversations tab and open the conversation if possible
      if (props.onNavigateToConversation && props.onNavigateToTab) {
        props.onNavigateToConversation(conversationId);
        props.onNavigateToTab("conversations");
      } else {
        toast.info("Message sent! Go to the Conversations tab to continue chatting.");
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleViewProfile = (match: any) => {
    setSelectedProfile(match.otherProfile);
    setShowProfileModal(true);
  };

  // Like = match only
  const handleLike = async (profile: any) => {
    if (liked[profile.userId]) return;
    try {
      await createMatch({ targetUserId: profile.userId, interactionType: "like" });
      markLiked(profile.userId);
      toast.success(`You liked ${profile.displayName}! If they like you back, it's a match!`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to like profile.");
    }
  };

  // Super Like = add as friend (limit 10 per 24h)
  const handleSuperLike = async (profile: any) => {
    if (superLiked[profile.userId]) return;
    if (!canSuperLike) {
      const resetIn = Math.max(0, Math.floor(((resetTime || 0) - Date.now()) / (60 * 1000)));
      toast.error(`No Super Likes left. Try again in ${resetIn} minutes.`);
      return;
    }
    try {
      await sendFriendRequest({ toUserId: profile.userId });
      markSuperLiked(profile.userId);
      toast.success(`You sent a Super Like and friend request to ${profile.displayName}! 🌟`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to send Super Like.");
    }
  };

  if (!matches) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
          <div className="text-6xl mb-4">💫</div>
          <h2 className="text-2xl font-bold text-white mb-4">No matches yet</h2>
          <p className="text-white/70">
            Keep exploring profiles to find your cultural connections!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">Your Cultural Matches</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.filter(Boolean).map((match) => {
          if (!match || !match.otherProfile) return null;
          const status = getFriendStatus(match.otherProfile.userId);
          const isLiked = liked[match.otherProfile.userId];
          const isSuperLiked = superLiked[match.otherProfile.userId];
          return (
            <div
              key={match._id}
              className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all"
            >
              {/* Profile Image/Video */}
              <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 relative">
                {match.otherProfile.profileVideoUrl ? (
                  <video
                    src={match.otherProfile.profileVideoUrl}
                    className="w-full h-full object-cover"
                    controls
                    muted
                  />
                ) : match.otherProfile.profileImageUrl ? (
                  <img
                    src={match.otherProfile.profileImageUrl}
                    alt={match.otherProfile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-4xl text-white/50">👤</div>
                  </div>
                )}
                {/* Compatibility Score */}
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-sm font-semibold">
                    {match.compatibilityScore}%
                  </span>
                </div>
                {/* Like & Super Like Buttons */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
                  <button
                    onClick={() => handleLike(match.otherProfile)}
                    disabled={isLiked}
                    className={`bg-white/80 hover:bg-pink-500/90 text-pink-500 hover:text-white rounded-full p-2 shadow-lg transition-all duration-200 border-2 border-white text-2xl ${isLiked ? 'bg-pink-500 text-white scale-110 animate-pulse' : ''}`}
                    title={isLiked ? 'Liked' : 'Like (Match)'}
                  >
                    <span role="img" aria-label="like">❤️</span>
                  </button>
                  <button
                    onClick={() => handleSuperLike(match.otherProfile)}
                    disabled={isSuperLiked || !canSuperLike}
                    className={`bg-white/80 hover:bg-yellow-400/90 text-yellow-500 hover:text-white rounded-full p-2 shadow-lg transition-all duration-200 border-2 border-white text-2xl ${isSuperLiked ? 'bg-yellow-400 text-white scale-110 animate-bounce' : ''} ${!canSuperLike ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isSuperLiked ? 'Super Liked' : canSuperLike ? 'Super Like (Add as Friend)' : 'No Super Likes left'}
                  >
                    <span role="img" aria-label="superlike">🌟</span>
                  </button>
                </div>
                {/* Friend status badge */}
                {status === "friend" && (
                  <div className="absolute bottom-3 left-3 bg-green-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Friend</div>
                )}
                {status === "pending" && (
                  <div className="absolute bottom-3 left-3 bg-yellow-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-pulse">Pending</div>
                )}
                {status === "requested_you" && (
                  <div className="absolute bottom-3 left-3 bg-blue-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Requested You</div>
                )}
                {/* Profile Badges */}
                <div className="absolute bottom-3 left-3 z-10 flex gap-2 items-center">
                  {((match.otherProfile as any)?.verified === true) && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow">Verified</span>
                  )}
                  {((match.otherProfile as any)?.createdAt || 0) > 0 && Date.now() - (match.otherProfile as any)?.createdAt < 1000 * 60 * 60 * 24 * 7 && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow">New</span>
                  )}
                  {((match.otherProfile as any)?.lastActive || 0) > 0 && Date.now() - (match.otherProfile as any)?.lastActive < 1000 * 60 * 5 && (
                    <span className="bg-green-400 text-white px-2 py-1 rounded-full text-xs font-bold shadow animate-pulse">Online</span>
                  )}
                </div>
              </div>
              {/* Match Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {match.otherProfile.displayName}
                    </h3>
                    {/* Profile Badges */}
                    <div className="flex gap-2 mt-1">
                      {((match.otherProfile as any)?.verified === true) && (
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow">Verified</span>
                      )}
                      {((match.otherProfile as any)?.createdAt || 0) > 0 && Date.now() - (match.otherProfile as any)?.createdAt < 1000 * 60 * 60 * 24 * 7 && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow">New</span>
                      )}
                      {((match.otherProfile as any)?.lastActive || 0) > 0 && Date.now() - (match.otherProfile as any)?.lastActive < 1000 * 60 * 5 && (
                        <span className="bg-green-400 text-white px-2 py-1 rounded-full text-xs font-bold shadow animate-pulse">Online</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewProfile(match)}
                    className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-all"
                  >
                    View Profile
                  </button>
                </div>
                <p className="text-white/80 text-sm mb-4 line-clamp-2">
                  {match.otherProfile.bio}
                </p>
                {/* Shared Interests */}
                {match.sharedInterests && match.sharedInterests.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-white/70 text-sm font-medium mb-2">Shared Interests</h4>
                    <div className="flex flex-wrap gap-1">
                      {match.sharedInterests.slice(0, 3).map((interest: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-orange-500/20 text-orange-200 rounded text-xs">
                          {interest}
                        </span>
                      ))}
                      {match.sharedInterests.length > 3 && (
                        <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs">
                          +{match.sharedInterests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMessage(match)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all"
                  >
                    Message
                  </button>
                  <button
                    onClick={() => handleViewProfile(match)}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-all"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => handleAddFriend(match)}
                    disabled={pendingRequests[match.otherProfile.userId] || status !== "none"}
                    className={`px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-pink-600 transition-all ${pendingRequests[match.otherProfile.userId] || status !== "none" ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {status === "friend" && 'Already Friends'}
                    {status === "pending" && 'Pending'}
                    {status === "requested_you" && 'Requested You'}
                    {status === "none" && (pendingRequests[match.otherProfile.userId] ? 'Request Sent...' : 'Add Friend')}
                  </button>
                </div>
                {/* Match Date */}
                <p className="text-white/50 text-xs mt-3 text-center">
                  Matched {new Date(match.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Super Like Counter */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full shadow-lg text-yellow-400 font-bold text-lg backdrop-blur-md border border-yellow-300">
        <span role="img" aria-label="superlike">🌟</span> {maxPerDay - count} Super Likes (Add as Friend) left today
      </div>

      {/* Message Prompt Modal */}
      {showMessagePrompt && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Send Message</h3>
              <button
                onClick={() => setShowMessagePrompt(false)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {selectedMatch.otherProfile.profileImageUrl ? (
                    <img
                      src={selectedMatch.otherProfile.profileImageUrl}
                      alt={selectedMatch.otherProfile.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm">👤</span>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedMatch.otherProfile.displayName}</p>
                  <p className="text-white/60 text-sm">{selectedMatch.otherProfile.location}</p>
                  <p className="text-white/50 text-xs">{selectedMatch.compatibilityScore}% match</p>
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Message</label>
                <textarea
                  value={messagePrompt}
                  onChange={(e) => setMessagePrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 h-32"
                  placeholder="Write a message to start a conversation..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMessagePrompt(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messagePrompt.trim()}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Media */}
              <div className="relative">
                {selectedProfile.profileVideoUrl ? (
                  <video
                    src={selectedProfile.profileVideoUrl}
                    className="w-full h-64 object-cover rounded-xl"
                    controls
                    muted
                  />
                ) : selectedProfile.profileImageUrl ? (
                  <img
                    src={selectedProfile.profileImageUrl}
                    alt={selectedProfile.displayName}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <div className="text-6xl text-white/50">👤</div>
                  </div>
                )}
                {/* Friend status badge in modal */}
                {getFriendStatus(selectedProfile.userId) === "friend" && (
                  <div className="absolute top-3 left-3 bg-green-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Friend</div>
                )}
                {getFriendStatus(selectedProfile.userId) === "pending" && (
                  <div className="absolute top-3 left-3 bg-yellow-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-pulse">Pending</div>
                )}
                {getFriendStatus(selectedProfile.userId) === "requested_you" && (
                  <div className="absolute top-3 left-3 bg-blue-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Requested You</div>
                )}
                {/* Profile Badges in Modal */}
                <div className="flex gap-2 mb-4">
                  {((selectedProfile as any)?.verified === true) && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow">Verified</span>
                  )}
                  {((selectedProfile as any)?.createdAt || 0) > 0 && Date.now() - (selectedProfile as any)?.createdAt < 1000 * 60 * 60 * 24 * 7 && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow">New</span>
                  )}
                  {((selectedProfile as any)?.lastActive || 0) > 0 && Date.now() - (selectedProfile as any)?.lastActive < 1000 * 60 * 5 && (
                    <span className="bg-green-400 text-white px-2 py-1 rounded-full text-xs font-bold shadow animate-pulse">Online</span>
                  )}
                </div>
              </div>
              {/* Profile Info */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedProfile.displayName}</h2>
                <p className="text-white/70 mb-4">{selectedProfile.age} • {selectedProfile.location}</p>
                <p className="text-white/80">{selectedProfile.bio}</p>
              </div>

              {/* Cultural Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">Cultural Background</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.culturalBackground?.map((bg: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm">
                        {bg}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.languages?.map((lang: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.values?.map((value: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {[...(selectedProfile.foodPreferences || []), ...(selectedProfile.musicGenres || [])].slice(0, 6).map((interest: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-orange-500/20 text-orange-200 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>



              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-white/20">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setSelectedMatch({ otherProfile: selectedProfile });
                    setShowMessagePrompt(true);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  Message
                </button>
                <button
                  onClick={() => handleAddFriend({ otherProfile: selectedProfile })}
                  disabled={pendingRequests[selectedProfile.userId] || getFriendStatus(selectedProfile.userId) !== "none"}
                  className={`flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all ${pendingRequests[selectedProfile.userId] || getFriendStatus(selectedProfile.userId) !== "none" ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {getFriendStatus(selectedProfile.userId) === "friend" && 'Already Friends'}
                  {getFriendStatus(selectedProfile.userId) === "pending" && 'Pending'}
                  {getFriendStatus(selectedProfile.userId) === "requested_you" && 'Requested You'}
                  {getFriendStatus(selectedProfile.userId) === "none" && (pendingRequests[selectedProfile.userId] ? 'Request Sent...' : 'Add Friend')}
                </button>
                <button
                  onClick={() => { setShowProfileModal(false); toast.success('User blocked.'); }}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold hover:from-red-600 hover:to-pink-700 transition-all"
                >
                  Block
                </button>
                <button
                  onClick={() => { setShowProfileModal(false); toast.success('User reported.'); }}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all"
                >
                  Report
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

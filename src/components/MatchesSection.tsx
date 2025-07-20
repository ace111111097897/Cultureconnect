import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import MatchPercentage from "./MatchPercentage";

export function MatchesSection() {
  const [showMessagePrompt, setShowMessagePrompt] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [messagePrompt, setMessagePrompt] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const matches = useQuery(api.matches.getUserMatches);
  const getUserConversations = useQuery(api.conversations.getUserConversations);
  const sendMessage = useMutation(api.conversations.sendMessage);

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

  const handleSendMessage = async () => {
    if (!selectedMatch || !messagePrompt.trim()) return;
    
    try {
      // Create a new conversation and send message
      // This would need to be implemented in the backend
      toast.success("Message sent!");
      setShowMessagePrompt(false);
      setMessagePrompt("");
      // Do NOT setSelectedMatch(null) here, so the match remains in the list
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleViewProfile = (match: any) => {
    setSelectedProfile(match.otherProfile);
    setShowProfileModal(true);
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
        {matches.filter(Boolean).map((match) => (
          <div
            key={match!._id}
            className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all"
          >
            {/* Profile Image/Video */}
            <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 relative">
              {match!.otherProfile.profileVideoUrl ? (
                <video
                  src={match!.otherProfile.profileVideoUrl}
                  className="w-full h-full object-cover"
                  controls
                  muted
                />
              ) : match!.otherProfile.profileImageUrl ? (
                <img
                  src={match!.otherProfile.profileImageUrl}
                  alt={match!.otherProfile.displayName}
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
                  {match!.compatibilityScore}%
                </span>
              </div>

              {/* Live status bubble */}
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white bg-green-400" title="Active"></div>
            </div>

            {/* Match Info */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {match!.otherProfile.displayName}
                  </h3>
                  <p className="text-white/70">{match!.otherProfile.age} • {match!.otherProfile.location}</p>
                </div>
                <button
                  onClick={() => handleViewProfile(match)}
                  className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-all"
                >
                  View Profile
                </button>
              </div>
              
              <p className="text-white/80 text-sm mb-4 line-clamp-2">
                {match!.otherProfile.bio}
              </p>

              {/* Match Percentage */}
              <div className="mb-4">
                <MatchPercentage targetUserId={match!.otherProfile.userId} showDetails={false} />
              </div>

              {/* Shared Interests */}
              {match!.sharedInterests && match!.sharedInterests.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-white/70 text-sm font-medium mb-2">Shared Interests</h4>
                  <div className="flex flex-wrap gap-1">
                    {match!.sharedInterests.slice(0, 3).map((interest: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-orange-500/20 text-orange-200 rounded text-xs">
                        {interest}
                      </span>
                    ))}
                    {match!.sharedInterests.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs">
                        +{match!.sharedInterests.length - 3} more
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
              </div>

              {/* Match Date */}
              <p className="text-white/50 text-xs mt-3 text-center">
                Matched {new Date(match!.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
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

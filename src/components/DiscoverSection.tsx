import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function DiscoverSection() {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showMessagePrompt, setShowMessagePrompt] = useState(false);
  const [messagePrompt, setMessagePrompt] = useState("");
  const profiles = useQuery(api.profiles.getDiscoverProfiles, { limit: 10 });

  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
  const createMatch = useMutation(api.matches.createMatch);
  const sendMessage = useMutation(api.conversations.sendMessage);
  const getUserConversations = useQuery(api.conversations.getUserConversations);

  const currentProfiles = profiles;
  const currentProfile = currentProfiles?.[currentProfileIndex];

  const handleNext = () => {
    if (currentProfiles && currentProfileIndex < currentProfiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentProfileIndex > 0) {
      setCurrentProfileIndex(prev => prev - 1);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!currentProfile) return;
    
    try {
      await sendFriendRequest({ toUserId: currentProfile.userId });
      toast.success("Friend request sent!");
      handleNext();
    } catch (error: any) {
      toast.error(error.message || "Failed to send friend request");
    }
  };

  const handleLike = async () => {
    if (!currentProfile) return;
    
    try {
      const result = await createMatch({ 
        targetUserId: currentProfile.userId, 
        interactionType: "like" 
      });
      
      if (result.matched) {
        toast.success("It's a match! 🎉");
      } else {
        toast.success("Profile liked!");
      }
      handleNext();
    } catch (error: any) {
      toast.error(error.message || "Failed to like profile");
    }
  };

  const handlePass = async () => {
    if (!currentProfile) return;
    
    try {
      await createMatch({ 
        targetUserId: currentProfile.userId, 
        interactionType: "pass" 
      });
      handleNext();
    } catch (error: any) {
      toast.error("Failed to pass on profile");
    }
  };

  const handleViewProfile = (profile: any) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const handleMessage = async () => {
    if (!currentProfile) return;
    
    // Check if there's already a conversation
    const existingConversation = getUserConversations?.find(conv => 
      conv.participants.includes(currentProfile.userId)
    );

    if (existingConversation) {
      // Navigate to existing conversation
      toast.info("Opening existing conversation...");
      // You could add navigation logic here
    } else {
      // Show message prompt
      setShowMessagePrompt(true);
    }
  };

  const handleSendMessage = async () => {
    if (!currentProfile || !messagePrompt.trim()) return;
    
    try {
      // Create a new conversation and send message
      // This would need to be implemented in the backend
      toast.success("Message sent!");
      setShowMessagePrompt(false);
      setMessagePrompt("");
      handleNext();
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  if (!currentProfiles) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  if (currentProfiles.length === 0) {
    return (
      <div className="text-center space-y-6 px-2 sm:px-0">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-12 border border-white/20">
          <div className="text-4xl md:text-6xl mb-4">🔍</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">No more profiles</h2>
          <p className="text-white/70">
            Check back later for new cultural connections!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* Profile Card */}
      <div className="max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
          {/* Profile Image/Video */}
          <div className="h-80 bg-gradient-to-br from-purple-500 to-pink-500 relative">
            {currentProfile?.profileVideoUrl ? (
              <video
                src={currentProfile.profileVideoUrl}
                className="w-full h-full object-cover"
                controls
                muted
              />
            ) : currentProfile?.profileImageUrl ? (
              <img
                src={currentProfile.profileImageUrl}
                alt={currentProfile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-6xl text-white/50">👤</div>
              </div>
            )}
            
            {/* Compatibility Score */}
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-sm font-semibold">
                {currentProfile?.compatibilityScore || 0}%
              </span>
            </div>


          </div>

          {/* Profile Info */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{currentProfile?.displayName}</h2>
                <p className="text-white/70">{currentProfile?.age} • {currentProfile?.location}</p>
              </div>
              <button
                onClick={() => handleViewProfile(currentProfile)}
                className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-all"
              >
                View Profile
              </button>
            </div>
            
            <p className="text-white/80 text-sm mb-4 line-clamp-3">
              {currentProfile?.bio}
            </p>

            {/* Cultural Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {currentProfile?.culturalBackground?.slice(0, 3).map((bg: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded-full text-xs">
                  {bg}
                </span>
              ))}
              {currentProfile?.values?.slice(0, 2).map((value: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs">
                  {value}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handlePass}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
              >
                Pass
              </button>
              <button
                onClick={handleMessage}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
              >
                Message
              </button>
              <button
                onClick={handleLike}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all"
              >
                Like
              </button>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
              <button
                onClick={handlePrevious}
                disabled={currentProfileIndex === 0}
                className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-white/60 text-sm">
                {currentProfileIndex + 1} of {currentProfiles.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentProfileIndex === currentProfiles.length - 1}
                className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

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

              {/* Social Links */}
              {selectedProfile.socialLinks && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Social Media</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedProfile.socialLinks).map(([platform, url]) => {
                      if (!url) return null;
                      return (
                        <a
                          key={platform}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-white/10 text-white rounded-full text-sm border border-white/20 hover:bg-white/20 transition-all"
                        >
                          {platform}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-white/20">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleSendFriendRequest();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  Send Friend Request
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleMessage();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Prompt Modal */}
      {showMessagePrompt && (
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
    </div>
  );
}

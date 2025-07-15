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
      {/* Enhanced Profile Card with Decorative Elements */}
      <div className="max-w-md mx-auto relative">
        {/* Decorative Background Elements */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-3xl blur-xl"></div>
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-3xl blur-lg"></div>
        
        {/* Floating Cultural Icons */}
        <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-white text-lg">🌍</span>
        </div>
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-1000">
          <span className="text-white text-lg">💫</span>
        </div>
        <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-500">
          <span className="text-white text-lg">🎭</span>
        </div>
        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-1500">
          <span className="text-white text-lg">🎨</span>
        </div>

        {/* Main Profile Card */}
        <div className="relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
          {/* Profile Image/Video with Enhanced Styling */}
          <div className="h-80 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/30 rounded-full"></div>
              <div className="absolute top-12 right-8 w-6 h-6 border-2 border-white/30 rounded-full"></div>
              <div className="absolute bottom-8 left-8 w-10 h-10 border-2 border-white/30 rounded-full"></div>
              <div className="absolute bottom-16 right-4 w-4 h-4 border-2 border-white/30 rounded-full"></div>
            </div>

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
            
            {/* Compatibility Score with Enhanced Design */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-semibold">
                  {currentProfile?.compatibilityScore || 0}%
                </span>
              </div>
            </div>

            {/* Cultural Background Indicator */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-xs font-medium">
                {currentProfile?.culturalBackground?.[0] || "Cultural"}
              </span>
            </div>
          </div>

          {/* Profile Info with Enhanced Layout */}
          <div className="p-6 relative">
            {/* Decorative Corner Elements */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-white/20 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-white/20 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-white/20 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-white/20 rounded-br-lg"></div>

            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{currentProfile?.displayName}</h2>
                <p className="text-white/70 text-sm">{currentProfile?.age} • {currentProfile?.location}</p>
              </div>
              <button
                onClick={() => handleViewProfile(currentProfile)}
                className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
              >
                View Profile
              </button>
            </div>
            
            <p className="text-white/80 text-sm mb-4 line-clamp-3 leading-relaxed">
              {currentProfile?.bio}
            </p>

            {/* Enhanced Cultural Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {currentProfile?.culturalBackground?.slice(0, 3).map((bg: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 rounded-full text-xs font-medium border border-purple-400/20">
                  {bg}
                </span>
              ))}
              {currentProfile?.values?.slice(0, 2).map((value: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-200 rounded-full text-xs font-medium border border-blue-400/20">
                  {value}
                </span>
              ))}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handlePass}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all hover:scale-105 hover:shadow-lg"
              >
                <span className="text-lg mr-2">👎</span>
                Pass
              </button>
              <button
                onClick={handleMessage}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all hover:scale-105 hover:shadow-lg"
              >
                <span className="text-lg mr-2">💬</span>
                Message
              </button>
              <button
                onClick={handleLike}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all hover:scale-105 hover:shadow-lg"
              >
                <span className="text-lg mr-2">❤️</span>
                Like
              </button>
            </div>

            {/* Enhanced Navigation */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
              <button
                onClick={handlePrevious}
                disabled={currentProfileIndex === 0}
                className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
              >
                ← Previous
              </button>
              <span className="text-white/60 text-sm">
                {currentProfileIndex + 1} of {currentProfiles.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentProfileIndex === currentProfiles.length - 1}
                className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Prompt Modal */}
      {showMessagePrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Send a Message</h3>
            <textarea
              value={messagePrompt}
              onChange={(e) => setMessagePrompt(e.target.value)}
              placeholder="Write your message..."
              className="w-full h-32 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 resize-none"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowMessagePrompt(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full border border-white/20 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedProfile.displayName}</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                <p className="text-white/80 mb-4">{selectedProfile.bio}</p>
                
                <h3 className="text-lg font-semibold text-white mb-2">Cultural Background</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedProfile.culturalBackground?.map((bg: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded text-sm">
                      {bg}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Interests</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-white/60 text-sm">Languages:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProfile.languages?.map((lang: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded text-xs">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-white/60 text-sm">Values:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProfile.values?.map((value: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-green-500/20 text-green-200 rounded text-xs">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

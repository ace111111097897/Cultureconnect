import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function DiscoverSection() {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  
  const profiles = useQuery(api.profiles.getDiscoverProfiles, { limit: 10 });
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);

  const currentProfile = profiles?.[currentProfileIndex];

  const handleNext = () => {
    if (profiles && currentProfileIndex < profiles.length - 1) {
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

  if (!profiles) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  if (profiles.length === 0) {
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

  if (!currentProfile) {
    return (
      <div className="text-center space-y-6 px-2 sm:px-0">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-12 border border-white/20">
          <div className="text-4xl md:text-6xl mb-4">🎉</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">You've seen everyone!</h2>
          <p className="text-white/70">
            Check back later for new cultural connections!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 px-2 sm:px-0">
      {/* Profile Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
        {/* Profile Image */}
        <div className="h-64 md:h-96 bg-gradient-to-br from-purple-500 to-pink-500 relative">
          {currentProfile.profileImageUrl ? (
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
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white font-semibold">
              {currentProfile.compatibilityScore}% Match
            </span>
          </div>

          {/* Navigation */}
          <div className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2">
            <button
              onClick={handlePrevious}
              disabled={currentProfileIndex === 0}
              className="w-10 h-10 md:w-12 md:h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/70 transition-all text-sm md:text-base"
            >
              ←
            </button>
          </div>
          
          <div className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2">
            <button
              onClick={handleNext}
              disabled={currentProfileIndex >= profiles.length - 1}
              className="w-10 h-10 md:w-12 md:h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/70 transition-all text-sm md:text-base"
            >
              →
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {currentProfile.displayName}, {currentProfile.age}
            </h2>
            <p className="text-white/70 text-base md:text-lg">{currentProfile.location}</p>
            <p className="text-white/80 mt-3 text-sm md:text-base">{currentProfile.bio}</p>
          </div>

          {/* Cultural Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white/80 font-medium mb-3">🌍 Cultural Background</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.culturalBackground.slice(0, 3).map((bg, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm">
                    {bg}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white/80 font-medium mb-3">🗣️ Languages</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.languages.slice(0, 3).map((lang, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white/80 font-medium mb-3">💫 Values</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.values.slice(0, 3).map((value, index) => (
                  <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm">
                    {value}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white/80 font-medium mb-3">🍽️ Food Interests</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.foodPreferences.slice(0, 3).map((food, index) => (
                  <span key={index} className="px-3 py-1 bg-orange-500/20 text-orange-200 rounded-full text-sm">
                    {food}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 md:space-x-4">
            <button
              onClick={handleNext}
              className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all font-semibold text-sm md:text-base"
            >
              Pass
            </button>
            <button
              onClick={handleSendFriendRequest}
              className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all text-sm md:text-base"
            >
              Add Friend
            </button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="text-center">
        <p className="text-white/60">
          {currentProfileIndex + 1} of {profiles.length} profiles
        </p>
        <div className="w-full bg-white/20 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentProfileIndex + 1) / profiles.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

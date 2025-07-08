import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function DiscoverSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const profiles = useQuery(api.profiles.getDiscoverProfiles, { limit: 10 });
  const createMatch = useMutation(api.matches.createMatch);

  const handleInteraction = async (interactionType: "like" | "pass") => {
    if (!profiles || profiles.length === 0) return;

    const currentProfile = profiles[currentIndex];
    
    try {
      const result = await createMatch({
        targetUserId: currentProfile.userId,
        interactionType,
      });

      if (result.matched) {
        toast.success("🎉 It's a match! You can now start chatting.");
      }

      // Move to next profile
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  if (!profiles) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-white mb-4">You've explored all available profiles!</h2>
          <p className="text-white/70 mb-6">
            Check back later for new cultural connections, or explore other sections of the app.
          </p>
          <button
            onClick={() => setCurrentIndex(0)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
        {/* Profile Image */}
        <div className="h-96 bg-gradient-to-br from-purple-500 to-pink-500 relative">
          {currentProfile.profileImageUrl ? (
            <img
              src={currentProfile.profileImageUrl}
              alt={currentProfile.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-8xl text-white/50">👤</div>
            </div>
          )}
          
          {/* Compatibility Score */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white font-semibold">
              {currentProfile.compatibilityScore}% Match
            </span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-8 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {currentProfile.displayName}, {currentProfile.age}
            </h2>
            <p className="text-white/70 mb-4">{currentProfile.location}</p>
            <p className="text-white/80">{currentProfile.bio}</p>
          </div>

          {/* Cultural Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">🌍 Cultural Background</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.culturalBackground.map((bg, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm"
                  >
                    {bg}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">🗣️ Languages</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">🎵 Music</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.musicGenres.slice(0, 4).map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">🍽️ Food</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.foodPreferences.slice(0, 4).map((food, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-500/20 text-orange-200 rounded-full text-sm"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-3">💫 Values</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.values.map((value, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-500/20 text-pink-200 rounded-full text-sm"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6 pt-6">
            <button
              onClick={() => handleInteraction("pass")}
              className="w-16 h-16 rounded-full bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 transition-all flex items-center justify-center text-2xl"
            >
              ✕
            </button>
            
            <button
              onClick={() => handleInteraction("like")}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 transition-all flex items-center justify-center text-2xl shadow-lg"
            >
              ❤️
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="text-center text-white/50 text-sm">
            {currentIndex + 1} of {profiles.length} profiles
          </div>
        </div>
      </div>
    </div>
  );
}

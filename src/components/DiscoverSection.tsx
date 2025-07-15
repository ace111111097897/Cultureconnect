import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

// Inline ProfileModal component (restore if needed)
function ProfileModal({ profile, onClose }: { profile: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative mx-2 animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-gray-200 mb-4 overflow-hidden flex items-center justify-center">
            {profile.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-7xl text-gray-400">person</span>
            )}
          </div>
          <div className="font-bold text-2xl mb-1 text-gray-900">{profile.displayName}</div>
          <div className="text-gray-700 mb-2 text-center">{profile.bio || "No bio yet."}</div>
        </div>
      </div>
      {/* Click outside to close */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
    </div>
  );
}

export function DiscoverSection() {
  const profiles = useQuery(api.profiles.getDiscoverProfiles, { limit: 20 });
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-800 flex flex-col items-center justify-center py-4">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 overflow-y-auto max-h-[80vh] p-2 rounded-2xl">
        {profiles.map(profile => (
          <div
            key={profile.userId}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl flex flex-col items-center min-h-[260px] sm:min-h-[320px] mb-6 sm:mb-0 cursor-pointer hover:scale-105 transition-transform max-w-full"
            onClick={() => setSelectedProfile(profile)}
            tabIndex={0}
            role="button"
            aria-label={`View profile for ${profile.displayName}`}
          >
            {profile.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt={profile.displayName} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-white/30 mb-4" />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/10 flex items-center justify-center text-6xl text-white/50 mb-4">👤</div>
            )}
            <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">{profile.displayName}</div>
            <div className="text-gray-700 text-base mb-2 text-center">{profile.bio || "No bio yet."}</div>
            {/* Extra info: culture, food, etc. */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {profile.culturalBackground && profile.culturalBackground.length > 0 && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Culture: {profile.culturalBackground.join(", ")}</span>
              )}
              {profile.foodPreferences && profile.foodPreferences.length > 0 && (
                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-semibold">Food: {profile.foodPreferences.join(", ")}</span>
              )}
              {profile.languages && profile.languages.length > 0 && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Languages: {profile.languages.join(", ")}</span>
              )}
              {profile.musicGenres && profile.musicGenres.length > 0 && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">Music: {profile.musicGenres.join(", ")}</span>
              )}
              {profile.travelInterests && profile.travelInterests.length > 0 && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">Travel: {profile.travelInterests.join(", ")}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {selectedProfile && (
        <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </div>
  );
}

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { ProfileModal } from "./ProfileModal";

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
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 overflow-y-auto max-h-[80vh] p-2 rounded-2xl">
        {profiles.map(profile => (
          <div
            key={profile.userId}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg flex flex-col items-center min-h-[180px] sm:min-h-[220px] mb-4 sm:mb-0 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setSelectedProfile(profile)}
            tabIndex={0}
            role="button"
            aria-label={`View profile for ${profile.displayName}`}
          >
            {profile.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt={profile.displayName} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white/30 mb-3" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 flex items-center justify-center text-4xl text-white/50 mb-3">👤</div>
            )}
            <div className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{profile.displayName}</div>
            <div className="text-gray-600 text-sm mb-2 text-center">{profile.bio || "No bio yet."}</div>
          </div>
        ))}
      </div>
      {selectedProfile && (
        <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </div>
  );
}

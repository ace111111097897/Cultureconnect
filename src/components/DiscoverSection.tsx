import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import React from "react";

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
  const [visibleProfiles, setVisibleProfiles] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Sync visibleProfiles with profiles from backend
  React.useEffect(() => {
    if (profiles) setVisibleProfiles(profiles);
  }, [profiles]);

  const handlePass = (userId: string) => {
    setVisibleProfiles(prev => prev.filter(p => p.userId !== userId));
    setNotifications(n => ["You passed on a profile.", ...n]);
  };
  const handleAddFriend = (profile: any) => {
    setNotifications(n => [
      `Friend request sent to ${profile.displayName}.`,
      ...n
    ]);
    // TODO: Call backend to add friend
  };
  const handleMatch = (profile: any) => {
    setNotifications(n => [
      `You matched with ${profile.displayName}!`,
      ...n
    ]);
    // TODO: Call backend to match
  };

  if (!profiles) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  if (visibleProfiles.length === 0) {
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
      {/* Notification Area */}
      {notifications.length > 0 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          {notifications.slice(0, 3).map((note, idx) => (
            <div key={idx} className="mb-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/80 to-pink-500/80 text-white shadow-lg text-center animate-fadeIn">
              {note}
            </div>
          ))}
        </div>
      )}
      <div className="w-full max-w-5xl mx-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-2 rounded-2xl min-h-[calc(100vh-5rem)]">
        {visibleProfiles.map(profile => (
          <div
            key={profile.userId}
            className="relative bg-gradient-to-br from-white/10 via-blue-900/30 to-purple-800/30 border-4 border-white/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-between min-h-[340px] h-full mb-6 sm:mb-0 cursor-pointer hover:scale-105 transition-transform max-w-full backdrop-blur-xl"
            tabIndex={0}
            role="region"
            aria-label={`Profile for ${profile.displayName}`}
          >
            {profile.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt={profile.displayName} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white/40 mb-4 shadow-lg" />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/10 flex items-center justify-center text-6xl text-white/50 mb-4 border-4 border-white/40 shadow-lg">👤</div>
            )}
            <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 text-center drop-shadow-lg">{profile.displayName}</div>
            <div className="text-gray-700 text-base mb-2 text-center">{profile.bio || "No bio yet."}</div>
            {/* Extra info: culture, food, etc. */}
            <div className="flex flex-wrap justify-center gap-2 mt-2 mb-4">
              {profile.culturalBackground && profile.culturalBackground.length > 0 && (
                <span className="bg-blue-100/60 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">Culture: {profile.culturalBackground.join(", ")}</span>
              )}
              {profile.foodPreferences && profile.foodPreferences.length > 0 && (
                <span className="bg-pink-100/60 text-pink-900 px-3 py-1 rounded-full text-xs font-semibold">Food: {profile.foodPreferences.join(", ")}</span>
              )}
              {profile.languages && profile.languages.length > 0 && (
                <span className="bg-green-100/60 text-green-900 px-3 py-1 rounded-full text-xs font-semibold">Languages: {profile.languages.join(", ")}</span>
              )}
              {profile.musicGenres && profile.musicGenres.length > 0 && (
                <span className="bg-purple-100/60 text-purple-900 px-3 py-1 rounded-full text-xs font-semibold">Music: {profile.musicGenres.join(", ")}</span>
              )}
              {profile.travelInterests && profile.travelInterests.length > 0 && (
                <span className="bg-yellow-100/60 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">Travel: {profile.travelInterests.join(", ")}</span>
              )}
            </div>
            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto w-full justify-center">
              <button
                className="flex-1 bg-red-500/80 text-white rounded-lg px-4 py-2 font-semibold hover:bg-red-600/90 transition shadow-md"
                onClick={() => handlePass(profile.userId)}
              >
                Pass
              </button>
              <button
                className="flex-1 bg-green-500/80 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-600/90 transition shadow-md"
                onClick={() => handleAddFriend(profile)}
              >
                Add Friend
              </button>
              <button
                className="flex-1 bg-blue-500/80 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-600/90 transition shadow-md"
                onClick={() => handleMatch(profile)}
              >
                Match
              </button>
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

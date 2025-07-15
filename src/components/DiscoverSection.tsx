import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import React, { useState, useEffect, useRef } from "react";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Sync visibleProfiles with profiles from backend
  useEffect(() => {
    if (profiles) setVisibleProfiles(profiles);
    setCurrentIndex(0);
  }, [profiles]);

  const handlePass = () => {
    setNotifications(n => ["You passed on a profile.", ...n]);
    setCurrentIndex(idx => Math.min(idx + 1, visibleProfiles.length - 1));
  };
  const handleAddFriend = (profile: any) => {
    setNotifications(n => [
      `Friend request sent to ${profile.displayName}.`,
      ...n
    ]);
    // TODO: Call backend to add friend
  };
  const handleMatch = () => {
    setNotifications(n => [
      `You matched with ${visibleProfiles[currentIndex]?.displayName}!`,
      ...n
    ]);
    setCurrentIndex(idx => Math.min(idx + 1, visibleProfiles.length - 1));
    // TODO: Call backend to match
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -50) handlePass(); // swipe left
    else if (deltaX > 50) handleMatch(); // swipe right
    touchStartX.current = null;
  };

  if (!profiles) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  if (!visibleProfiles.length || currentIndex >= visibleProfiles.length) {
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

  const profile = visibleProfiles[currentIndex];

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
      <div
        className="w-full flex-1 flex flex-col items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-white/10 via-blue-900/30 to-purple-800/30 border-2 border-transparent rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-between min-h-[400px] h-full mb-6 cursor-pointer hover:scale-105 transition-transform max-w-full backdrop-blur-xl group"
          style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.25), 0 0 0 4px rgba(80,120,255,0.15)' }}
        >
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 blur-md opacity-60 group-hover:opacity-90 transition-all group-hover:blur-lg z-0" style={{ filter: 'blur(8px)' }} />
            {profile.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt={profile.displayName} className="w-32 h-32 rounded-full object-cover border-4 border-blue-400/40 shadow-xl relative z-10" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center text-6xl text-white/50 border-4 border-blue-400/40 shadow-xl relative z-10">👤</div>
            )}
            <div className="absolute inset-0 rounded-full border-4 border-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 animate-pulse z-0" style={{ pointerEvents: 'none', opacity: 0.7 }} />
          </div>
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
              onClick={handlePass}
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
              onClick={handleMatch}
            >
              Match
            </button>
          </div>
          {/* Swipe buttons for desktop */}
          <div className="flex justify-between w-full mt-8">
            <button
              className="bg-white/10 hover:bg-red-500/80 text-red-700 hover:text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-md transition"
              onClick={handlePass}
              aria-label="Pass"
            >
              &#8592;
            </button>
            <button
              className="bg-white/10 hover:bg-blue-500/80 text-blue-700 hover:text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-md transition"
              onClick={handleMatch}
              aria-label="Match"
            >
              &#8594;
            </button>
          </div>
        </div>
      </div>
      {selectedProfile && (
        <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </div>
  );
}

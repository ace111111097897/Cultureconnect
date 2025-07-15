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
        <div className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-400/40 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]" style={{ boxShadow: '0 4px 32px 0 rgba(80,120,255,0.15), 0 0 16px 4px rgba(160,80,255,0.10)' }}>
          {/* Top Gradient Section */}
          <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] h-48 flex flex-col items-center justify-center">
            {/* Match % */}
            <div className="absolute top-4 right-4 bg-black/40 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg z-10">0% Match</div>
            {/* Left/Right Arrows */}
            <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-purple-400/60 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl shadow-md transition z-10" onClick={handlePass} aria-label="Pass">&#8592;</button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-pink-400/60 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl shadow-md transition z-10" onClick={handleMatch} aria-label="Match">&#8594;</button>
            {/* Avatar */}
            <div className="relative z-10">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={profile.displayName} className="w-24 h-24 rounded-full object-cover border-4 border-white/60 shadow-xl" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-6xl text-white/60 border-4 border-white/60 shadow-xl">👤</div>
              )}
            </div>
          </div>
          {/* Info Section */}
          <div className="bg-gradient-to-br from-[#1a1a2e]/90 via-[#16213e]/90 to-[#0f3460]/90 p-8 flex flex-col gap-4 backdrop-blur-xl">
            <div className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              {profile.displayName && <span>{profile.displayName}</span>}
              {profile.age && <span className="text-white/70 text-lg font-normal">, {profile.age}</span>}
            </div>
            {/* Cultural Background */}
            {profile.culturalBackground && profile.culturalBackground.length > 0 && (
              <div>
                <div className="font-bold text-white flex items-center gap-2 mb-1"><span role="img" aria-label="globe">🌍</span> Cultural Background</div>
                <div className="flex flex-wrap gap-2">
                  {profile.culturalBackground.map((c: string) => (
                    <span key={c} className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-inner border border-white/20">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div>
                <div className="font-bold text-white flex items-center gap-2 mb-1"><span role="img" aria-label="languages">🗣️</span> Languages</div>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((l: string) => (
                    <span key={l} className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-inner border border-white/20">{l}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Values */}
            {profile.values && profile.values.length > 0 && (
              <div>
                <div className="font-bold text-white flex items-center gap-2 mb-1"><span role="img" aria-label="values">💡</span> Values</div>
                <div className="flex flex-wrap gap-2">
                  {profile.values.map((v: string) => (
                    <span key={v} className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-inner border border-white/20">{v}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Food Preferences */}
            {profile.foodPreferences && profile.foodPreferences.length > 0 && (
              <div>
                <div className="font-bold text-white flex items-center gap-2 mb-1"><span role="img" aria-label="food">🍽️</span> Food Interests</div>
                <div className="flex flex-wrap gap-2">
                  {profile.foodPreferences.map((f: string) => (
                    <span key={f} className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-inner border border-white/20">{f}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex gap-4 mt-6 w-full">
              <button
                className="flex-1 bg-white/10 text-white rounded-xl px-6 py-3 font-semibold hover:bg-purple-500/80 hover:text-white transition shadow-md border border-white/20 text-lg"
                onClick={handlePass}
              >
                Pass
              </button>
              <button
                className="flex-1 bg-gradient-to-r from-[#4e54c8] to-[#8f94fb] text-white rounded-xl px-6 py-3 font-semibold hover:from-[#3d43a8] hover:to-[#7e84db] transition shadow-md border border-white/20 text-lg"
                onClick={() => handleAddFriend(profile)}
              >
                Add Friend
              </button>
            </div>
          </div>
        </div>
      </div>
      {selectedProfile && (
        <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </div>
  );
}

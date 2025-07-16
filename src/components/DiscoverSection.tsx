import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import React, { useState, useEffect, useRef } from "react";

// Add modal for 'View More'
function ProfileModal({ profile, onClose }: { profile: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-3xl shadow-2xl p-8 max-w-lg w-full relative">
        <button className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl" onClick={onClose}>✕</button>
        <div className="flex flex-col items-center">
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt={profile.displayName} className="w-32 h-32 rounded-full object-cover border-4 border-purple-400/40 shadow-xl mb-4" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-6xl text-white/60 border-4 border-purple-400/40 shadow-xl mb-4">👤</div>
          )}
          <div className="text-2xl font-bold text-white mb-2">{profile.displayName}</div>
          <div className="text-white/80 mb-4">{profile.bio || "No bio yet."}</div>
          {/* Show all details */}
          <div className="w-full space-y-2">
            {profile.culturalBackground && profile.culturalBackground.length > 0 && (
              <div><span className="font-bold text-white">Culture:</span> <span className="text-white/80">{profile.culturalBackground.join(", ")}</span></div>
            )}
            {profile.languages && profile.languages.length > 0 && (
              <div><span className="font-bold text-white">Languages:</span> <span className="text-white/80">{profile.languages.join(", ")}</span></div>
            )}
            {profile.values && profile.values.length > 0 && (
              <div><span className="font-bold text-white">Values:</span> <span className="text-white/80">{profile.values.join(", ")}</span></div>
            )}
            {profile.foodPreferences && profile.foodPreferences.length > 0 && (
              <div><span className="font-bold text-white">Food:</span> <span className="text-white/80">{profile.foodPreferences.join(", ")}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DiscoverSection() {
  const profiles = useQuery(api.profiles.getDiscoverProfiles, { limit: 20 });
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [visibleProfiles, setVisibleProfiles] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Simulate current user for mutual interests and completion
  const currentUser = {
    languages: ["English", "Spanish"],
    values: ["Personal growth", "Environmental consciousness"],
    foodPreferences: ["Latin American", "Fusion"],
    profileCompletion: 80,
  };

  // Sync visibleProfiles with profiles from backend
  useEffect(() => {
    if (profiles) setVisibleProfiles(profiles);
    setCurrentIndex(0);
  }, [profiles]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setCurrentIndex(idx => Math.min(idx + 1, visibleProfiles.length - 1));
      if (e.key === 'ArrowLeft') setCurrentIndex(idx => Math.max(idx - 1, 0));
      if (e.key === 'Enter') setShowModal(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleProfiles.length]);

  const handlePass = () => {
    setCurrentIndex(idx => Math.min(idx + 1, visibleProfiles.length - 1));
  };
  const handleAddFriend = (profile: any) => {
    setNotifications(n => [
      `Friend request sent to ${profile.displayName}.`,
      ...n
    ]);
    // TODO: Call backend to add friend
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -50) setCurrentIndex(idx => Math.max(idx - 1, 0));
    else if (deltaX > 50) setCurrentIndex(idx => Math.min(idx + 1, visibleProfiles.length - 1));
    touchStartX.current = null;
  };

  const [liked, setLiked] = useState(false);
  const [showMatch, setShowMatch] = useState(false);

  // Like/Heart button handler
  const handleLike = () => {
    setLiked(true);
    // Simulate a match (in real app, check backend)
    setTimeout(() => setShowMatch(true), 600);
    setTimeout(() => setLiked(false), 1200);
    setTimeout(() => setShowMatch(false), 2500);
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
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-800 flex flex-col items-center justify-center py-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-purple-700 opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-1/3 h-1/3 bg-pink-600 opacity-20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-1/4 h-1/4 bg-blue-500 opacity-20 rounded-full blur-2xl animate-pulse" />
      </div>
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
        className="w-full flex-1 flex flex-col items-center justify-center z-10"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Profile Completion Progress Bar */}
        <div className="w-full max-w-2xl mx-auto mb-4">
          <div className="w-full bg-white/10 rounded-full h-3">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: `${currentUser.profileCompletion}%` }}></div>
          </div>
          <div className="text-right text-xs text-white/60 mt-1">Profile Completion: {currentUser.profileCompletion}%</div>
        </div>
        {/* Profile Counter */}
        <div className="mb-4 text-white/80 text-lg font-semibold select-none">
          Profile {currentIndex + 1} of {visibleProfiles.length}
        </div>
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-400/40 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-8 py-12">
          {/* Floating Like/Heart Button */}
          <button
            className={`absolute top-8 right-8 z-30 w-16 h-16 flex items-center justify-center rounded-full bg-pink-500/80 shadow-xl text-4xl text-white transition-all duration-200 hover:scale-110 focus:outline-none ${liked ? 'animate-ping-fast' : ''}`}
            onClick={handleLike}
            aria-label="Like Profile"
            title="Like (L)"
            style={{ boxShadow: liked ? '0 0 0 12px rgba(236,72,153,0.25)' : undefined }}
          >
            <span className={`transition-all duration-200 ${liked ? 'scale-125 text-pink-300' : ''}`}>❤️</span>
          </button>
          {/* Match Animation/Modal */}
          {showMatch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-3xl shadow-2xl p-12 flex flex-col items-center animate-bounceIn">
                <div className="text-6xl mb-4">🎉</div>
                <div className="text-3xl font-bold text-white mb-2">It's a Match!</div>
                <div className="text-white/80 mb-4">You and {profile.displayName} like each other!</div>
              </div>
            </div>
          )}
          {/* Left Arrow */}
          <button
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-20 h-20 flex items-center justify-center text-5xl rounded-full transition-all duration-200
              ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 hover:bg-purple-700/30 opacity-90'}
            `}
            onClick={() => setCurrentIndex(idx => Math.max(idx - 1, 0))}
            aria-label="Previous Profile"
            disabled={currentIndex === 0}
            title="Left Arrow (←)"
          >
            &#8592;
          </button>
          {/* Right Arrow */}
          <button
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-20 h-20 flex items-center justify-center text-5xl rounded-full transition-all duration-200
              ${currentIndex === visibleProfiles.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 hover:bg-pink-700/30 opacity-90'}
            `}
            onClick={() => setCurrentIndex(idx => Math.min(idx + 1, visibleProfiles.length - 1))}
            aria-label="Next Profile"
            disabled={currentIndex === visibleProfiles.length - 1}
            title="Right Arrow (→)"
          >
            &#8594;
          </button>
          {/* Top Gradient Section with large avatar */}
          <div className="relative flex flex-col items-center justify-center mb-8">
            {/* Glowing animated border */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-pink-500 blur-2xl opacity-40 animate-pulse" />
            </div>
            <div className="relative z-10">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={profile.displayName} className="w-48 h-48 rounded-full object-cover border-8 border-purple-400/60 shadow-2xl" />
              ) : (
                <div className="w-48 h-48 rounded-full bg-white/20 flex items-center justify-center text-8xl text-white/60 border-8 border-purple-400/60 shadow-2xl">👤</div>
              )}
            </div>
          </div>
          {/* Info Section */}
          <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-[#1a1a2e]/90 via-[#16213e]/90 to-[#0f3460]/90 p-10 rounded-2xl shadow-xl flex flex-col gap-6 items-center justify-center backdrop-blur-xl">
            <div className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              {profile.displayName && <span>{profile.displayName}</span>}
              {profile.age && <span className="text-white/70 text-2xl font-normal">, {profile.age}</span>}
            </div>
            {/* Cultural Background */}
            {profile.culturalBackground && profile.culturalBackground.length > 0 && (
              <div className="w-full">
                <div className="font-bold text-white flex items-center gap-2 mb-1"><span role="img" aria-label="globe">🌍</span> Cultural Background</div>
                <div className="flex flex-wrap gap-2">
                  {profile.culturalBackground.map((c: string) => (
                    <span key={c} className="bg-white/10 text-white px-4 py-2 rounded-full text-base font-semibold shadow-inner border border-white/20">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Languages (highlight mutuals) */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="w-full">
                <div className="font-bold text-white flex items-center gap-2 mb-1"><span role="img" aria-label="languages">🗣️</span> Languages</div>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((l: string) => (
                    <span key={l} className={`px-4 py-2 rounded-full text-base font-semibold shadow-inner border ${currentUser.languages.includes(l) ? 'bg-green-500/30 border-green-400 text-green-100' : 'bg-white/10 border-white/20 text-white'}`}>{l}{currentUser.languages.includes(l) && ' • Mutual'}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Values (highlight mutuals) */}
            {profile.values && profile.values.length > 0 && (
              <div className="w-full">
                <div className="font-bold text-white flex items-center gap-2 mb-1"><span role="img" aria-label="values">💡</span> Values</div>
                <div className="flex flex-wrap gap-2">
                  {profile.values.map((v: string) => (
                    <span key={v} className={`px-4 py-2 rounded-full text-base font-semibold shadow-inner border ${currentUser.values.includes(v) ? 'bg-blue-500/30 border-blue-400 text-blue-100' : 'bg-white/10 border-white/20 text-white'}`}>{v}{currentUser.values.includes(v) && ' • Mutual'}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Food Preferences (highlight mutuals) */}
            {profile.foodPreferences && profile.foodPreferences.length > 0 && (
              <div className="w-full">
                <div className="font-bold text-white flex items-center gap-2 mb-1"><span role="img" aria-label="food">🍽️</span> Food Interests</div>
                <div className="flex flex-wrap gap-2">
                  {profile.foodPreferences.map((f: string) => (
                    <span key={f} className={`px-4 py-2 rounded-full text-base font-semibold shadow-inner border ${currentUser.foodPreferences.includes(f) ? 'bg-pink-500/30 border-pink-400 text-pink-100' : 'bg-white/10 border-white/20 text-white'}`}>{f}{currentUser.foodPreferences.includes(f) && ' • Mutual'}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex gap-6 mt-8 w-full justify-center">
              <button
                className="flex-1 bg-white/10 text-white rounded-xl px-8 py-4 font-semibold hover:bg-purple-500/80 hover:text-white transition shadow-md border border-white/20 text-xl"
                onClick={handlePass}
              >
                Pass
              </button>
              <button
                className="flex-1 bg-gradient-to-r from-[#4e54c8] to-[#8f94fb] text-white rounded-xl px-8 py-4 font-semibold hover:from-[#3d43a8] hover:to-[#7e84db] transition shadow-md border border-white/20 text-xl"
                onClick={() => handleAddFriend(profile)}
              >
                Add Friend
              </button>
              <button
                className="flex-1 bg-white/10 text-white rounded-xl px-8 py-4 font-semibold hover:bg-pink-500/80 hover:text-white transition shadow-md border border-white/20 text-xl"
                onClick={() => setShowModal(true)}
              >
                View More
              </button>
            </div>
          </div>
          {/* Swipe/arrow hint for desktop */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-base select-none pointer-events-none hidden md:block">
            <span className="mr-2">←</span> Use arrows or swipe to browse <span className="ml-2">→</span>
          </div>
        </div>
        {/* Modal for View More */}
        {showModal && <ProfileModal profile={profile} onClose={() => setShowModal(false)} />}
      </div>
    </div>
  );
}

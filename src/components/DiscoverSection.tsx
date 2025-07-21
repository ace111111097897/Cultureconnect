import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
// import MatchPercentage from "./MatchPercentage";

// Add modal for 'View More'
function ProfileModal({ profile, onClose }: { profile: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-3xl shadow-2xl p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl" onClick={onClose}>✕</button>
        <div className="flex flex-col items-center">
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt={profile.displayName} className="w-32 h-32 rounded-full object-cover border-4 border-purple-400/40 shadow-xl mb-4" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-6xl text-white/60 border-4 border-purple-400/40 shadow-xl mb-4">👤</div>
          )}
          <div className="text-2xl font-bold text-white mb-2">{profile.displayName}, {profile.age}</div>
          <div className="text-white/80 mb-4">{profile.bio || "No bio yet."}</div>
          
          {/* Match Percentage - Temporarily disabled */}
          {/* <div className="w-full mb-6">
            <MatchPercentage targetUserId={profile.userId} showDetails={true} />
          </div> */}
          
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
            {profile.musicGenres && profile.musicGenres.length > 0 && (
              <div><span className="font-bold text-white">Music:</span> <span className="text-white/80">{profile.musicGenres.join(", ")}</span></div>
            )}
            {profile.travelInterests && profile.travelInterests.length > 0 && (
              <div><span className="font-bold text-white">Travel:</span> <span className="text-white/80">{profile.travelInterests.join(", ")}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const useLikedProfiles = () => {
  const [liked, setLiked] = useState<{ [userId: string]: boolean }>({});
  const markLiked = (userId: string) => setLiked(prev => ({ ...prev, [userId]: true }));
  return { liked, markLiked };
};

const useSuperLike = (maxPerDay = 10) => {
  const [superLiked, setSuperLiked] = useState<{ [userId: string]: boolean }>({});
  const [count, setCount] = useState(0);
  const [resetTime, setResetTime] = useState<number>(() => {
    const stored = localStorage.getItem('superLikeResetTime');
    return stored ? parseInt(stored) : 0;
  });
  useEffect(() => {
    const now = Date.now();
    if (resetTime && now > resetTime) {
      setCount(0);
      setSuperLiked({});
      localStorage.setItem('superLikeCount', '0');
      localStorage.setItem('superLikeResetTime', (now + 24 * 60 * 60 * 1000).toString());
      setResetTime(now + 24 * 60 * 60 * 1000);
    }
  }, [resetTime]);
  useEffect(() => {
    const storedCount = localStorage.getItem('superLikeCount');
    if (storedCount) setCount(parseInt(storedCount));
  }, []);
  const canSuperLike = count < maxPerDay;
  const markSuperLiked = (userId: string) => {
    setSuperLiked(prev => ({ ...prev, [userId]: true }));
    setCount(c => {
      const newCount = c + 1;
      localStorage.setItem('superLikeCount', newCount.toString());
      if (!resetTime) {
        const nextReset = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('superLikeResetTime', nextReset.toString());
        setResetTime(nextReset);
      }
      return newCount;
    });
  };
  return { superLiked, canSuperLike, markSuperLiked, count, maxPerDay, resetTime };
};

// Mobile Bottom Navigation (only on mobile)
function MobileBottomNav({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 via-black/60 to-transparent flex justify-around items-center h-16 sm:hidden border-t border-white/10">
      <button onClick={() => setActiveTab('discover')} className={`flex flex-col items-center text-xs ${activeTab === 'discover' ? 'text-pink-400' : 'text-white/70'}`}><span className="text-2xl">🔍</span>Discover</button>
      <button onClick={() => setActiveTab('matches')} className={`flex flex-col items-center text-xs ${activeTab === 'matches' ? 'text-pink-400' : 'text-white/70'}`}><span className="text-2xl">💫</span>Matches</button>
      <button onClick={() => setActiveTab('friends')} className={`flex flex-col items-center text-xs ${activeTab === 'friends' ? 'text-pink-400' : 'text-white/70'}`}><span className="text-2xl">👥</span>Friends</button>
      <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-xs ${activeTab === 'profile' ? 'text-pink-400' : 'text-white/70'}`}><span className="text-2xl">👤</span>Profile</button>
    </nav>
  );
}

export function DiscoverSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [visibleProfiles, setVisibleProfiles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const touchStartX = useRef<number | null>(null);
  
  const profiles = useQuery(api.profiles.getDiscoverProfiles, { limit: 20 });
  const currentUser = useQuery(api.profiles.getCurrentUserProfile);
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
  const createMatch = useMutation(api.matches.createMatch);
  const { liked, markLiked } = useLikedProfiles();
  const { superLiked, canSuperLike, markSuperLiked, count, maxPerDay, resetTime } = useSuperLike();

  // Simulate current user for mutual interests and completion
  const currentUserProfile = currentUser;
  const currentUserProfileCompletion = 80; // Default completion percentage

  // For demo: allow switching tabs on mobile
  const [mobileTab, setMobileTab] = useState('discover');

  // Helper: get mutual friends/info (demo)
  const getMutualInfo = (profile: any) => {
    // For demo, show a fake number or use profile.mutualFriends if available
    if (profile.mutualFriends) return `${profile.mutualFriends} mutual friends`;
    return '12 mutual friends';
  };

  // Sync visibleProfiles with profiles from backend
  useEffect(() => {
    if (profiles) {
      setVisibleProfiles(profiles);
      setCurrentIndex(0);
    }
  }, [profiles]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCurrentIndex(idx => Math.max(idx - 1, 0));
      else if (e.key === 'ArrowRight') setCurrentIndex(idx => Math.min(idx + 1, visibleProfiles.length - 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleProfiles.length]);

  const handlePass = () => {
    setCurrentIndex(idx => Math.min(idx + 1, visibleProfiles.length - 1));
  };

  const handleAddFriend = async (profile: any) => {
    try {
      console.log("Sending friend request to:", profile);
      console.log("Profile userId:", profile.userId);
      await sendFriendRequest({ toUserId: profile.userId });
      
      const notificationMessage = `Friend request sent to ${profile.displayName}.`;
      setNotifications(n => [notificationMessage, ...n]);
      
      // Remove the notification after 1 second
      setTimeout(() => {
        setNotifications(n => n.filter(notification => notification !== notificationMessage));
      }, 1000);
      
      toast.success(`Friend request sent to ${profile.displayName}!`);
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      toast.error(error.message || "Failed to send friend request.");
    }
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

  // Like = match only
  const handleLike = async (profile: any) => {
    if (liked[profile.userId]) return;
    try {
      await createMatch({ targetUserId: profile.userId, interactionType: "like" });
      markLiked(profile.userId);
      toast.success(`You liked ${profile.displayName}! If they like you back, it's a match!`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to like profile.");
    }
  };

  // Super Like = add as friend (limit 10 per 24h)
  const handleSuperLike = async (profile: any) => {
    if (superLiked[profile.userId]) return;
    if (!canSuperLike) {
      const resetIn = Math.max(0, Math.floor(((resetTime || 0) - Date.now()) / (60 * 1000)));
      toast.error(`No Super Likes left. Try again in ${resetIn} minutes.`);
      return;
    }
    try {
      await sendFriendRequest({ toUserId: profile.userId });
      markSuperLiked(profile.userId);
      toast.success(`You sent a Super Like and friend request to ${profile.displayName}! 🌟`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to send Super Like.");
    }
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

  // Stories row: use visibleProfiles for demo
  const stories = visibleProfiles.slice(0, 10);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-800 flex flex-col items-center justify-center py-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-purple-700 opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-1/3 h-1/3 bg-pink-600 opacity-20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-1/4 h-1/4 bg-blue-500 opacity-20 rounded-full blur-2xl animate-pulse" />
      </div>
      {/* Stories Row (Mobile Only) */}
      <div className="w-full flex sm:hidden overflow-x-auto py-3 px-3 mb-4">
        <div className="flex gap-5">
          <div className="flex flex-col items-center">
            <button className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-400 to-orange-400 flex items-center justify-center text-3xl text-white border-2 border-white/40 shadow-lg mb-1">+</button>
            <span className="text-xs text-white/80">Add Story</span>
          </div>
          {stories.map((user: any, idx: number) => (
            <div key={user.userId || idx} className="flex flex-col items-center">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.displayName} className="w-16 h-16 rounded-full object-cover border-2 border-pink-400 shadow mb-1" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl text-white/60 border-2 border-pink-400 shadow mb-1">👤</div>
              )}
              <span className="text-xs text-white/80 truncate max-w-[3.5rem]">{user.displayName}</span>
            </div>
          ))}
        </div>
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
        {/* Profile Counter (Mobile Only) */}
        <div className="mb-2 text-white/80 text-base font-semibold select-none sm:hidden">
          Profile {currentIndex + 1} of {visibleProfiles.length}
        </div>
        {/* Mobile: Full-bleed card */}
        <div className="w-full sm:hidden flex flex-col items-center justify-center relative">
          <div className="relative bg-white/10 rounded-3xl shadow-xl border border-white/20 flex flex-col items-center hover:scale-105 transition-all hover-lift mx-auto w-full max-w-sm px-2 p-0 mb-16 sm:mb-0">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={profile.displayName}
                className="w-full h-48 object-cover rounded-t-3xl cursor-pointer"
                onClick={() => setSelectedProfile(profile)}
              />
            ) : (
              <div
                className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-t-3xl cursor-pointer"
                onClick={() => setSelectedProfile(profile)}
              >
                <span className="text-4xl text-white/60">👤</span>
              </div>
            )}
            {/* Overlayed info at bottom */}
            <div className="w-full flex flex-col items-start p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-white">{profile.displayName}, {profile.age}</span>
                {/* Profile Badges */}
                {profile.verified && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow ml-1">Verified</span>
                )}
                {profile.createdAt && Date.now() - profile.createdAt < 1000 * 60 * 60 * 24 * 7 && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow ml-1">New</span>
                )}
                {profile.lastActive && Date.now() - profile.lastActive < 1000 * 60 * 5 && (
                  <span className="bg-green-400 text-white px-2 py-1 rounded-full text-xs font-bold shadow ml-1 animate-pulse">Online</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
                <span className="text-xs text-white/80">Recently Active</span>
              </div>
            </div>
            {/* Like & Super Like Buttons */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
              <button
                onClick={() => handleLike(profile)}
                disabled={liked[profile.userId]}
                className={`bg-white/80 hover:bg-pink-500/90 text-pink-500 hover:text-white rounded-full p-2 shadow-lg transition-all duration-200 border-2 border-white text-2xl ${liked[profile.userId] ? 'bg-pink-500 text-white scale-110 animate-pulse' : ''}`}
                title={liked[profile.userId] ? 'Liked' : 'Like (Match)'}
              >
                <span role="img" aria-label="like">❤️</span>
              </button>
              <button
                onClick={() => handleSuperLike(profile)}
                disabled={superLiked[profile.userId] || !canSuperLike}
                className={`bg-white/80 hover:bg-yellow-400/90 text-yellow-500 hover:text-white rounded-full p-2 shadow-lg transition-all duration-200 border-2 border-white text-2xl ${superLiked[profile.userId] ? 'bg-yellow-400 text-white scale-110 animate-bounce' : ''} ${!canSuperLike ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={superLiked[profile.userId] ? 'Super Liked' : canSuperLike ? 'Super Like (Add as Friend)' : 'No Super Likes left'}
              >
                <span role="img" aria-label="superlike">🌟</span>
              </button>
            </div>
          </div>
        </div>
        {/* Desktop: Grid of cards (unchanged) */}
        <div className="hidden sm:flex flex-wrap justify-center gap-6 w-full max-w-6xl mx-auto mt-8 px-2 sm:px-0">
          {visibleProfiles.map((profile: any, idx: number) => (
            <div
              key={profile._id || idx}
              className="relative bg-white/10 rounded-3xl shadow-xl border border-white/20 flex flex-col items-center hover:scale-105 transition-all hover-lift mx-auto w-full max-w-sm px-2 p-0 mb-16 sm:mb-0"
            >
              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt={profile.displayName}
                  className="w-full h-48 object-cover rounded-t-3xl cursor-pointer"
                  onClick={() => setSelectedProfile(profile)}
                />
              ) : (
                <div
                  className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-t-3xl cursor-pointer"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <span className="text-4xl text-white/60">👤</span>
                </div>
              )}
              {/* Like & Super Like Buttons */}
              <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
                <button
                  onClick={() => handleLike(profile)}
                  disabled={liked[profile.userId]}
                  className={`bg-white/80 hover:bg-pink-500/90 text-pink-500 hover:text-white rounded-full p-2 shadow-lg transition-all duration-200 border-2 border-white text-2xl ${liked[profile.userId] ? 'bg-pink-500 text-white scale-110 animate-pulse' : ''}`}
                  title={liked[profile.userId] ? 'Liked' : 'Like (Match)'}
                >
                  <span role="img" aria-label="like">❤️</span>
                </button>
                <button
                  onClick={() => handleSuperLike(profile)}
                  disabled={superLiked[profile.userId] || !canSuperLike}
                  className={`bg-white/80 hover:bg-yellow-400/90 text-yellow-500 hover:text-white rounded-full p-2 shadow-lg transition-all duration-200 border-2 border-white text-2xl ${superLiked[profile.userId] ? 'bg-yellow-400 text-white scale-110 animate-bounce' : ''} ${!canSuperLike ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={superLiked[profile.userId] ? 'Super Liked' : canSuperLike ? 'Super Like (Add as Friend)' : 'No Super Likes left'}
                >
                  <span role="img" aria-label="superlike">🌟</span>
                </button>
              </div>
              {/* Name, Age, Status */}
              <div className="w-full flex flex-col items-start p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-white">{profile.displayName}, {profile.age}</span>
                  {/* Profile Badges */}
                  {profile.verified && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow ml-1">Verified</span>
                  )}
                  {profile.createdAt && Date.now() - profile.createdAt < 1000 * 60 * 60 * 24 * 7 && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow ml-1">New</span>
                  )}
                  {profile.lastActive && Date.now() - profile.lastActive < 1000 * 60 * 5 && (
                    <span className="bg-green-400 text-white px-2 py-1 rounded-full text-xs font-bold shadow ml-1 animate-pulse">Online</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
                  <span className="text-xs text-white/80">Recently Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Profile Modal Popup */}
        {selectedProfile && (
          <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
        )}
        {/* Swipe/arrow hint for desktop */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-base select-none pointer-events-none hidden md:block">
          <span className="mr-2">←</span> Use arrows or swipe to browse <span className="ml-2">→</span>
        </div>
      </div>
      {/* Super Like Counter */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full shadow-lg text-yellow-400 font-bold text-lg backdrop-blur-md border border-yellow-300">
        <span role="img" aria-label="superlike">🌟</span> {maxPerDay - count} Super Likes (Add as Friend) left today
      </div>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={mobileTab} setActiveTab={setMobileTab} />
    </div>
  );
}
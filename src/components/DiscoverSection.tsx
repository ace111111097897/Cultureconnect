import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import MatchPercentage from "./MatchPercentage";

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
          
          {/* Match Percentage */}
          <div className="w-full mb-6">
            <MatchPercentage targetUserId={profile.userId} showDetails={true} />
          </div>
          
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

  // Simulate current user for mutual interests and completion
  const currentUserProfile = currentUser;
  const currentUserProfileCompletion = 80; // Default completion percentage

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
        {/* Profile Counter */}
        <div className="mb-4 text-white/80 text-lg font-semibold select-none">
          Profile {currentIndex + 1} of {visibleProfiles.length}
        </div>
        {/* Replace the main profile display with a grid of cards: */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto mt-8">
          {visibleProfiles.map((profile: any, idx: number) => (
            <div
              key={profile._id || idx}
              className="relative bg-white/10 rounded-2xl shadow-lg border border-white/20 flex flex-col items-center p-0 hover:scale-105 transition-all hover-lift"
          >
              {/* Profile Image - only this opens the modal */}
              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt={profile.displayName}
                  className="w-full h-48 object-cover rounded-t-2xl cursor-pointer"
                  onClick={() => setSelectedProfile(profile)}
                />
              ) : (
                <div
                  className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-t-2xl cursor-pointer"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <span className="text-5xl text-white/60">👤</span>
                </div>
              )}
              {/* Name, Age, Status */}
              <div className="w-full flex flex-col items-start p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-white cursor-pointer hover:underline" onClick={() => setSelectedProfile(profile)}>{profile.displayName}, {profile.age}</span>
                  {profile.verified && <span className="text-blue-400 text-lg" title="Verified">✔️</span>}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
                  <span className="text-xs text-white/80">Recently Active</span>
                </div>
                
                {/* Compact Match Percentage */}
                <div className="w-full">
                  <MatchPercentage targetUserId={profile.userId} showDetails={false} />
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
    </div>
  );
}
import React, { useState } from "react";

// Profile type
interface Profile {
  id: number;
  name: string;
  bio: string;
  avatar: string;
  details: Record<string, any>;
}

function ProfileModal({ profile, onClose, onAddFriend, onPass, onMessage }: {
  profile: Profile;
  onClose: () => void;
  onAddFriend: () => void;
  onPass: () => void;
  onMessage: () => void;
}) {
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
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-7xl text-gray-400">person</span>
            )}
          </div>
          <div className="font-bold text-2xl mb-1 text-gray-900">{profile.name}</div>
          <div className="text-gray-700 mb-2 text-center">{profile.bio || "No bio yet."}</div>
          {/* Show all profile details if available */}
          <div className="w-full mb-4">
            {profile.details && Object.keys(profile.details).length > 0 && (
              <div className="space-y-1">
                {Object.entries(profile.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm text-gray-600">
                    <span className="font-medium capitalize">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 w-full mt-2 flex-col sm:flex-row">
            <button
              className="flex-1 bg-primary text-white rounded-lg px-4 py-2 font-semibold hover:bg-primary/90 transition"
              onClick={onMessage}
            >
              Message
            </button>
            <button
              className="flex-1 bg-green-500 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-600 transition"
              onClick={onAddFriend}
            >
              Add Friend
            </button>
            <button
              className="flex-1 bg-red-500 text-white rounded-lg px-4 py-2 font-semibold hover:bg-red-600 transition"
              onClick={onPass}
            >
              Pass
            </button>
          </div>
        </div>
      </div>
      {/* Click outside to close */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
    </div>
  );
}

export default function CommunityPage() {
  // Example profiles (replace with real data)
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: 1, name: "Tempto", bio: "I like fruits", avatar: "", details: { interests: "Fruits, Music" } },
    { id: 2, name: "Jay", bio: "Biker", avatar: "", details: { location: "NYC" } },
    { id: 3, name: "Kandi Culture", bio: "I'm your favorite AI Puppy! Ask me anything and I'll do my best to assist, welcome to the Culture App!", avatar: "", details: { role: "AI Assistant" } },
    // ... more profiles ...
  ]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Button handlers
  const handleAddFriend = () => {
    // TODO: Call backend to add friend
    alert(`Friend request sent to ${selectedProfile?.name}`);
    setSelectedProfile(null);
  };
  const handlePass = () => {
    if (selectedProfile) {
      setProfiles((prev) => prev.filter((p) => p.id !== selectedProfile.id));
      setSelectedProfile(null);
    }
  };
  const handleMessage = () => {
    // TODO: Navigate to chat or open chat window
    alert(`Starting chat with ${selectedProfile?.name}`);
    setSelectedProfile(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-orange-400 p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white/20 rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 cursor-pointer hover:scale-105 transition-transform min-h-[260px] min-w-[260px] max-w-full"
            onClick={() => setSelectedProfile(profile)}
          >
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-6xl text-gray-400">person</span>
              )}
            </div>
            {/* Name and Bio */}
            <div className="text-center">
              <div className="font-bold text-2xl text-white mb-1">{profile.name}</div>
              <div className="text-white/80 text-base">{profile.bio || "No bio yet."}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onAddFriend={handleAddFriend}
          onPass={handlePass}
          onMessage={handleMessage}
        />
      )}
    </div>
  );
} 
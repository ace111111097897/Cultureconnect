import React, { useState } from "react";

// Profile type
interface Profile {
  id: number;
  name: string;
  bio: string;
  avatar: string;
  details: Record<string, any>;
}

interface Group {
  id: number;
  name: string;
  members: string[];
  messages: { user: string; text: string }[];
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

  // Group chat state
  const [groups, setGroups] = useState<Group[]>([
    { id: 1, name: "Music Lovers", members: ["You"], messages: [{ user: "You", text: "Welcome to Music Lovers!" }] },
    { id: 2, name: "NYC Foodies", members: [], messages: [] },
  ]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinedGroupId, setJoinedGroupId] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState("");
  const currentUser = "You";

  // Profile button handlers
  const handleAddFriend = () => {
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
    alert(`Starting chat with ${selectedProfile?.name}`);
    setSelectedProfile(null);
  };

  // Group chat handlers
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setGroups(prev => [...prev, { id: Date.now(), name: newGroupName, members: [currentUser], messages: [{ user: currentUser, text: `Welcome to ${newGroupName}!` }] }]);
    setNewGroupName("");
    setShowCreateGroup(false);
  };
  const handleJoinGroup = (id: number) => {
    setGroups(prev => prev.map(g => g.id === id && !g.members.includes(currentUser) ? { ...g, members: [...g.members, currentUser] } : g));
    setJoinedGroupId(id);
  };
  const handleLeaveGroup = (id: number) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, members: g.members.filter(m => m !== currentUser) } : g));
    setJoinedGroupId(null);
  };
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || joinedGroupId === null) return;
    setGroups(prev => prev.map(g => g.id === joinedGroupId ? { ...g, messages: [...g.messages, { user: currentUser, text: chatInput }] } : g));
    setChatInput("");
  };

  const joinedGroup = groups.find(g => g.id === joinedGroupId);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-orange-400 p-6">
      {/* Group Chat Section */}
      <div className="w-full max-w-3xl mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Community Groups</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition" onClick={() => setShowCreateGroup(true)}>+ Create Group</button>
        </div>
        {/* List of groups */}
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.id} className="bg-white/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="font-bold text-lg text-purple-900 mb-2 sm:mb-0">{group.name}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Members: {group.members.length}</span>
                {group.members.includes(currentUser) ? (
                  <button className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-red-600 transition" onClick={() => handleLeaveGroup(group.id)}>Leave</button>
                ) : (
                  <button className="bg-green-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-green-600 transition" onClick={() => handleJoinGroup(group.id)}>Join</button>
                )}
                {joinedGroupId === group.id && <span className="ml-2 text-green-600 font-bold">Joined</span>}
              </div>
            </div>
          ))}
        </div>
        {/* Group Chat UI */}
        {joinedGroup && (
          <div className="mt-8 bg-white/30 rounded-2xl p-6 shadow-lg">
            <div className="font-bold text-xl text-purple-900 mb-2">{joinedGroup.name} Chat</div>
            <div className="h-48 overflow-y-auto bg-white/10 rounded-lg p-3 mb-4 flex flex-col gap-2">
              {joinedGroup.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.user === currentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-xl ${msg.user === currentUser ? 'bg-blue-500 text-white' : 'bg-white/80 text-purple-900'}`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                className="flex-1 px-4 py-2 rounded-xl bg-white/20 border border-white/30 text-purple-900 placeholder-purple-400 focus:outline-none"
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button type="submit" className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all">Send</button>
            </form>
          </div>
        )}
      </div>
      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowCreateGroup(false)}>✕</button>
            <div className="text-xl font-bold mb-4">Create Group</div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <input
                className="w-full border rounded-lg p-2"
                placeholder="Group Name"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                required
              />
              <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition">Create</button>
            </form>
          </div>
        </div>
      )}
      {/* Profile Section (unchanged) */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-10">
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
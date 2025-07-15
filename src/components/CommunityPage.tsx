import React from "react";

const users = [
  { id: 1, name: "Alice Kim", avatar: "https://randomuser.me/api/portraits/women/68.jpg", bio: "Loves Korean food and K-pop." },
  { id: 2, name: "Jamal Smith", avatar: "https://randomuser.me/api/portraits/men/32.jpg", bio: "World traveler and foodie." },
  { id: 3, name: "Priya Patel", avatar: "https://randomuser.me/api/portraits/women/44.jpg", bio: "Family and tradition are everything." },
  { id: 4, name: "Carlos Rivera", avatar: "https://randomuser.me/api/portraits/men/76.jpg", bio: "Soccer fan and salsa dancer." },
  { id: 5, name: "Sara Lee", avatar: "https://randomuser.me/api/portraits/women/12.jpg", bio: "Passionate about art and culture." },
];

export function CommunityPage() {
  return (
    <div className="w-full max-w-2xl mx-auto py-4 flex flex-col space-y-6 overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">Community</h2>
      {users.map(user => (
        <div key={user.id} className="flex items-center bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-md space-x-4">
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/30" />
          <div className="flex-1">
            <div className="text-lg font-semibold text-white">{user.name}</div>
            <div className="text-white/70 text-sm">{user.bio}</div>
          </div>
        </div>
      ))}
    </div>
  );
} 
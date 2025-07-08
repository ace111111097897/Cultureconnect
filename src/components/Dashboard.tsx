import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DiscoverSection } from "./DiscoverSection";
import { MatchesSection } from "./MatchesSection";
import { ConversationsSection } from "./ConversationsSection";
import { StoriesSection } from "./StoriesSection";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("discover");
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);

  const tabs = [
    { id: "discover", label: "Discover", icon: "🌟" },
    { id: "matches", label: "Matches", icon: "💫" },
    { id: "conversations", label: "Messages", icon: "💬" },
    { id: "stories", label: "Stories", icon: "📖" },
  ];

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">
          Welcome back, {userProfile.displayName}!
        </h1>
        <p className="text-white/70">
          Ready to explore meaningful connections through culture?
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
          <div className="flex space-x-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[60vh]">
        {activeTab === "discover" && <DiscoverSection />}
        {activeTab === "matches" && <MatchesSection />}
        {activeTab === "conversations" && <ConversationsSection />}
        {activeTab === "stories" && <StoriesSection />}
      </div>
    </div>
  );
}

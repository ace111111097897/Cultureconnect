import { useState } from "react";
import { DiscoverSection } from "./DiscoverSection";
import { MatchesSection } from "./MatchesSection";
import { ConversationsSection } from "./ConversationsSection";
import { StoriesSection } from "./StoriesSection";
import { ProfilePage } from "./ProfilePage";
import { FriendsSection } from "./FriendsSection";
import { KandiChat } from "./KandiChat";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("discover");

  const tabs = [
    { id: "discover", label: "Discover", icon: "🔍" },
    { id: "matches", label: "Matches", icon: "💫" },
    { id: "friends", label: "Friends", icon: "👥" },
    { id: "conversations", label: "Messages", icon: "💬" },
    { id: "kandi", label: "Kandi", icon: "🐕" },
    { id: "stories", label: "Stories", icon: "📖" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "discover":
        return <DiscoverSection />;
      case "matches":
        return <MatchesSection />;
      case "friends":
        return <FriendsSection />;
      case "conversations":
        return <ConversationsSection />;
      case "kandi":
        return <KandiChat />;
      case "stories":
        return <StoriesSection />;
      case "profile":
        return <ProfilePage />;
      default:
        return <DiscoverSection />;
    }
  };

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Navigation Tabs */}
      <div className="w-full overflow-hidden">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 mx-auto max-w-full">
          <div className="flex space-x-1 md:space-x-2 overflow-x-auto scrollbar-hide pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 md:px-4 py-2 md:py-3 rounded-xl font-medium transition-all flex items-center space-x-1 md:space-x-2 whitespace-nowrap text-xs md:text-sm flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-sm md:text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

import React, { useState, createContext, useContext } from "react";
import { DiscoverSection } from "./DiscoverSection";
import { MatchesSection } from "./MatchesSection";
import { ConversationsSection } from "./ConversationsSection";
import { StoriesSection } from "./StoriesSection";
import { ProfilePage } from "./ProfilePage";
import { FriendsSection } from "./FriendsSection";
import { KandiChat } from "./KandiChat";
import { GamesSection } from "./GamesSection";
import { CultureFeed } from "./CultureFeed";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Context for global tab and conversation selection
const DashboardContext = createContext<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
}>({
  activeTab: "discover",
  setActiveTab: () => {},
  selectedConversationId: null,
  setSelectedConversationId: () => {},
});

export function useDashboardContext() {
  return useContext(DashboardContext);
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Fetch conversations for unread count
  const conversations = useQuery(api.conversations.getUserConversations);
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);
  let unreadCount = 0;
  if (conversations && userProfile) {
    unreadCount = conversations.reduce((acc, conv) => {
      if (conv.messages) {
        acc += conv.messages.filter((msg: any) => !msg.isRead && msg.senderId !== userProfile.userId).length;
      }
      return acc;
    }, 0);
  }

  const tabs = [
    { id: "discover", label: "Discover", icon: "🔍" },
    { id: "games", label: "Games", icon: "🎮" },
    { id: "feed", label: "Culture Feed", icon: "🌍" },
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
      case "games":
        return <GamesSection />;
      case "feed":
        return <CultureFeed />;
      case "matches":
        return <MatchesSection onMessage={(conversationId) => {
          setActiveTab("conversations");
          setSelectedConversationId(conversationId);
        }} />;
      case "friends":
        return <FriendsSection />;
      case "conversations":
        return <ConversationsSection selectedConversationId={selectedConversationId} setSelectedConversationId={setSelectedConversationId} />;
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
    <DashboardContext.Provider value={{ activeTab, setActiveTab, selectedConversationId, setSelectedConversationId }}>
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="w-full overflow-hidden">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 mx-auto max-w-full">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== "conversations") setSelectedConversationId(null);
                  }}
                  className={`px-3 py-2 rounded-xl font-medium transition-all flex items-center space-x-2 whitespace-nowrap text-sm flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.id === "conversations" && unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>
                  )}
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
    </DashboardContext.Provider>
  );
}

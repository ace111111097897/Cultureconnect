import { useState } from "react";
import { DiscoverSection } from "./DiscoverSection";
import { MatchesSection } from "./MatchesSection";
import { ConversationsSection } from "./ConversationsSection";
import { StoriesSection } from "./StoriesSection";
import { ProfilePage } from "./ProfilePage";
import { FriendsSection } from "./FriendsSection";
import { KandiChat } from "./KandiChat";
import { GamesSection } from "./GamesSection";
import { CultureFeed } from "./CultureFeed";
import { FeedbackPage } from "./FeedbackPage";
import { CommunityPage } from "./CommunityPage";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("discover");

  const tabs = [
    { id: "discover", label: "Discover", icon: "🔍" },
    { id: "matches", label: "Matches", icon: "💫" },
    { id: "friends", label: "Friends", icon: "👥" },
    { id: "conversations", label: "Messages", icon: "💬" },
    { id: "games", label: "Games", icon: "🎮" },
    { id: "news", label: "News", icon: "📰" },
    { id: "kandi", label: "Kandi", icon: "🐕" },
    { id: "stories", label: "Stories", icon: "📖" },
    { id: "community", label: "Community", icon: "🌐" },
    { id: "feedback", label: "Feedback", icon: "💡" },
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
      case "games":
        return <GamesSection />;
      case "news":
        return <CultureFeed />;
      case "kandi":
        return <KandiChat />;
      case "stories":
        return <StoriesSection />;
      case "community":
        return <CommunityPage />;
      case "feedback":
        return <FeedbackPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <DiscoverSection />;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col bg-gradient-to-br from-orange-900/40 via-pink-900/30 to-yellow-900/30 backdrop-blur-2xl">
      {/* Top Nav Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-orange-500/60 to-pink-500/60 backdrop-blur-lg flex items-center px-4 z-40 shadow-lg">
        <div
          className="text-2xl font-bold text-white tracking-wide mr-8 cursor-pointer"
          onClick={() => setActiveTab('profile')}
        >
          CultureConnect
        </div>
        <div className="flex-1 flex items-center">
          <input
            type="text"
            placeholder="Search CultureConnect..."
            className="w-full max-w-md px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <div className="flex items-center space-x-4 ml-8">
          <button className="text-white/80 hover:text-white text-xl">🔔</button>
          <button className="text-white/80 hover:text-white text-xl">👤</button>
        </div>
      </header>

      {/* Mobile Top Toolbar */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-30 bg-gradient-to-r from-orange-500/40 to-pink-500/40 backdrop-blur-lg flex overflow-x-auto whitespace-nowrap scrollbar-hide py-2 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 mx-1 rounded-xl font-medium transition-all flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 pt-16 md:pt-16" style={{ paddingTop: '4rem' }}>
        {/* Left Sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-white/5 backdrop-blur-md border-r border-white/10 py-6 px-2 space-y-2 min-h-screen">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all text-lg w-full text-left ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-2 sm:p-4 md:p-8 max-w-4xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-orange-500/60 to-pink-500/60 backdrop-blur-lg flex md:hidden justify-around items-center h-16 border-t border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg font-medium transition-all text-sm ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

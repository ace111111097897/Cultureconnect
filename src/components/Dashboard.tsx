import { useState } from "react";
import { DiscoverSection } from "./DiscoverSection";
import { MatchesSection } from "./MatchesSection";
import { ConversationsSection } from "./ConversationsSection";
import { StoriesSection } from "./StoriesSection";
import { ProfilePage } from "./ProfilePage";
import { FriendsSection } from "./FriendsSection";
import { GamesSection } from "./GamesSection";
import { CultureFeed } from "./CultureFeed";
import CommunityPage from "./CommunityPage";
import { ExploreSection } from "./ExploreSection";
import KandiChat from "./KandiChat";

// Notification component
function NotificationDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications] = useState([
    {
      id: 1,
      type: "match",
      title: "New Cultural Match! 🎉",
      message: "You matched with Sarah from Mediterranean culture",
      time: "2 minutes ago",
      read: false,
      icon: "💫"
    },
    {
      id: 2,
      type: "friend",
      title: "Friend Request",
      message: "Alex wants to connect with you",
      time: "15 minutes ago",
      read: false,
      icon: "👥"
    },
    {
      id: 3,
      type: "event",
      title: "Cultural Event Reminder",
      message: "Mediterranean cooking class starts in 1 hour",
      time: "1 hour ago",
      read: true,
      icon: "🍳"
    },
    {
      id: 4,
      type: "message",
      title: "New Message",
      message: "Maria sent you a cultural story",
      time: "2 hours ago",
      read: true,
      icon: "💬"
    },
    {
      id: 5,
      type: "kandi",
      title: "Kandi AI Update",
      message: "Your AI companion has new cultural insights to share",
      time: "3 hours ago",
      read: true,
      icon: "🐕"
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Notification Dropdown */}
      <div className="absolute top-16 right-4 z-50 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 slide-in-top">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔔</span>
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold pulse-glow">
                {unreadCount}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover-scale"
          >
            ✕
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <span className="text-4xl mb-2 block">🔕</span>
              <p>No notifications yet</p>
              <p className="text-sm">We'll notify you about matches, events, and more!</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-xl mb-2 transition-all hover-lift cursor-pointer ${
                    notification.read 
                      ? 'bg-white/50 hover:bg-white/70' 
                      : 'bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${notification.read ? 'opacity-60' : 'pulse-glow'}`}>
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold text-sm ${
                          notification.read ? 'text-gray-600' : 'text-gray-800'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${
                        notification.read ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/20">
          <button className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-pink-600 transition-all hover-scale">
            View All Notifications
          </button>
        </div>
      </div>
    </>
  );
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("discover");
  const [initialConversationId, setInitialConversationId] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showConfirm, setShowConfirm] = useState<{ type: string; open: boolean }>({ type: '', open: false });
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showShareStory, setShowShareStory] = useState(false);
  const [showExplorePrompt, setShowExplorePrompt] = useState(false);
  const [icebreakerIndex, setIcebreakerIndex] = useState(0);
  const [showActionConfirm, setShowActionConfirm] = useState<{ type: string; open: boolean }>({ type: '', open: false });

  const icebreakerPrompts = [
    "If you could travel anywhere, where would you go?",
    "What's your go-to karaoke song?",
    "Describe your perfect weekend.",
    "What's your favorite food to cook or eat?",
    "If you could have dinner with anyone, who would it be?",
    "What's a fun fact about you?"
  ];

  const tabs = [
    { id: "discover", label: "Discover", icon: "🔍" },
    { id: "matches", label: "Matches", icon: "💫" },
    { id: "friends", label: "Friends", icon: "👥" },
    { id: "conversations", label: "Messages", icon: "💬" },
    { id: "games", label: "Games", icon: "🎮" },
    { id: "news", label: "News", icon: "📰" },
    { id: "stories", label: "Stories", icon: "📖" },
    { id: "events", label: "Events", icon: "📅", onClick: () => setShowEvents(true) },
    { id: "explore", label: "Explore", icon: "🧭" },
    { id: "icebreakers", label: "Icebreakers", icon: "✨", onClick: () => setShowIcebreakers(true) },
    { id: "success", label: "Success Stories", icon: "💖", onClick: () => setShowStories(true) },
    { id: "community", label: "Community", icon: "🌐" },
    { id: "favorites", label: "Favorites", icon: "⭐", onClick: () => setShowFavorites(true) },
    { id: "notifications", label: "Notifications", icon: "🔔", onClick: () => setShowNotifications(true) },
    { id: "settings", label: "Settings", icon: "⚙️", onClick: () => setShowSettings(true) },
    { id: "help", label: "Help & Safety", icon: "🛡️", onClick: () => setShowHelp(true) },
    { id: "verification", label: "Verification", icon: "✅", onClick: () => setShowVerification(true) },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "kandi", label: "Kandi AI", icon: "🐶" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "discover":
        return <DiscoverSection />;
      case "matches":
        return <MatchesSection />;
      case "friends":
        return <FriendsSection onNavigateToConversation={setInitialConversationId} onNavigateToTab={setActiveTab} />;
      case "conversations":
        return <ConversationsSection initialConversationId={initialConversationId} />;
      case "games":
        return <GamesSection />;
      case "news":
        return <CultureFeed />;
      case "stories":
        return <StoriesSection />;
      case "community":
        return <CommunityPage />;
      case "profile":
        return <ProfilePage />;
      case "explore":
        return <ExploreSection />;
      case "kandi":
        return <KandiChat />;
      default:
        return <DiscoverSection />;
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-800 backdrop-blur-2xl gradient-animation${darkMode ? ' dark' : ''}`}>
      {/* Top Nav Bar */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white/10 backdrop-blur-md items-center px-4 z-40 shadow-lg slide-in-top">
        <div className="text-2xl font-bold text-white tracking-wide mr-8 cursor-pointer hover-scale" onClick={() => setActiveTab('profile')}>
          CultureConnect
        </div>
        <div className="flex-1 flex items-center">
          <input
            type="text"
            placeholder="Search CultureConnect..."
            className="w-full max-w-md px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 hover-glow"
          />
        </div>
        <div className="flex items-center space-x-4 ml-8 relative">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              className="text-white/80 hover:text-white text-xl hover-scale relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {/* Notification Badge */}
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold pulse-glow">
                3
              </span>
            </button>
            <NotificationDropdown 
              isOpen={showNotifications} 
              onClose={() => setShowNotifications(false)} 
            />
          </div>
          <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition hover-scale" onClick={() => setActiveTab('profile')} title="Go to Profile">
            <span className="text-2xl">👤</span>
          </button>
        </div>
      </header>
      {/* Mobile Top Toolbar and Sidebar */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-30 bg-white/10 backdrop-blur-md flex overflow-x-auto whitespace-nowrap scrollbar-hide py-4 px-3 slide-in-top" style={{ WebkitOverflowScrolling: 'touch' }}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-3 mx-2 rounded-xl font-medium transition-all flex items-center space-x-2 stagger-item ${
                activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg pulse-glow'
                  : 'text-white/70 hover:text-white hover:bg-white/10 hover-scale'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
      </div>
      
      <div className="flex flex-1 pt-24 md:pt-16 min-h-[calc(100vh-5rem)]" style={{ paddingTop: '6rem' }}>
        {/* Left Sidebar */}
        {/* Example sidebar layout for desktop (md+): */}
        <aside className="hidden md:flex flex-col w-64 h-full bg-gradient-to-b from-purple-900 via-blue-900 to-pink-800 p-6 text-white rounded-r-2xl shadow-xl slide-in-left">
          {/* Top section: Profile and Settings */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center border-2 border-white float-animation">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <div className="font-bold text-lg">Your Profile</div>
                <div className="text-sm text-white/70">Verified User</div>
              </div>
            </div>
            <button 
              className="p-2 rounded-full hover:bg-white/20 transition hover-scale" 
              title="Settings"
              onClick={() => setShowSettings(true)}
            >
              <span className="text-2xl">⚙️</span>
            </button>
          </div>
          
          {/* Kandi under Profile */}
          <button
            className="flex items-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-300 to-pink-300 text-black font-semibold mb-6 hover:scale-105 transition shadow-lg bounce-gentle"
            onClick={() => setActiveTab("kandi")}
          >
            <span className="text-2xl">🐕</span>
            <span>Kandi AI</span>
          </button>
          
          {/* Main navigation */}
          <nav className="flex flex-col space-y-2 flex-1">
            <button 
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition text-left hover-lift"
              onClick={() => setActiveTab("discover")}
            >
              <span className="text-xl">🔍</span>
              <span>Discover</span>
            </button>
            <button 
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition text-left hover-lift"
              onClick={() => setActiveTab("matches")}
            >
              <span className="text-xl">💫</span>
              <span>Matches</span>
            </button>
            <button 
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition text-left hover-lift"
              onClick={() => setActiveTab("friends")}
            >
              <span className="text-xl">👥</span>
              <span>Friends</span>
            </button>
            <button 
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition text-left hover-lift"
              onClick={() => setActiveTab("messages")}
            >
              <span className="text-xl">💬</span>
              <span>Messages</span>
            </button>
            <button 
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition text-left hover-lift"
              onClick={() => setActiveTab("community")}
            >
              <span className="text-xl">🏘️</span>
              <span>Community</span>
            </button>
            <button 
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition text-left hover-lift"
              onClick={() => setActiveTab("explore")}
            >
              <span className="text-xl">📱</span>
              <span>Explore</span>
            </button>
            <button 
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition text-left hover-lift"
              onClick={() => setActiveTab("games")}
            >
              <span className="text-xl">🎮</span>
              <span>Games</span>
            </button>
            <button 
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition text-left hover-lift"
              onClick={() => setActiveTab("stories")}
            >
              <span className="text-xl">📖</span>
              <span>Stories</span>
            </button>
          </nav>
          
          {/* Bottom section */}
          <div className="mt-auto pt-6 border-t border-white/20">
            <button 
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition text-left w-full hover-lift"
              onClick={() => setShowVerification(true)}
            >
              <span className="text-xl">✅</span>
              <span>Verification</span>
              {isVerified && <span className="ml-auto text-green-400 pulse-glow">✔️</span>}
            </button>
            <button 
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-red-500/20 transition text-left w-full mt-2 text-red-300 hover:text-red-200 hover-lift"
              onClick={() => setShowConfirm({ type: 'logout', open: true })}
            >
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area - Full Screen */}
        <main className="flex-1 p-6 md:p-6 overflow-y-auto w-full fade-in">
          {/* Top section with culture tags */}
          <div className="mb-8 md:mb-8">
            <div className="flex items-center space-x-4 md:space-x-4 mb-6">
              <span className="px-4 py-3 bg-white/10 rounded-full text-white text-sm">Mediterranean</span>
              <span className="px-4 py-3 bg-white/10 rounded-full text-white text-sm">Fusion • Mutual</span>
        </div>
      </div>

          {/* Content based on active tab - Full Width */}
          <div className="w-full">
            {activeTab === "discover" && <DiscoverSection />}
            {activeTab === "matches" && <MatchesSection />}
            {activeTab === "friends" && <FriendsSection onNavigateToConversation={setInitialConversationId} onNavigateToTab={setActiveTab} />}
            {activeTab === "messages" && <ConversationsSection />}
            {activeTab === "community" && <CommunityPage />}
            {activeTab === "explore" && <ExploreSection />}
            {activeTab === "games" && <GamesSection />}
            {activeTab === "stories" && <StoriesSection />}
            {activeTab === "profile" && <ProfilePage />}
            {activeTab === "kandi" && (
              <div className="w-full">
                <KandiChat />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals/Panels for new sidebar items */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowSettings(false)}>✕</button>
            <div className="text-xl font-bold mb-4">Settings</div>
            <div className="space-y-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Dark Mode</span>
                <input type="checkbox" className="w-6 h-6" checked={darkMode} onChange={() => setDarkMode(d => !d)} />
              </div>
              {/* Notification Preferences */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Enable Notifications</span>
                <input type="checkbox" className="w-6 h-6" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(n => !n)} />
              </div>
              {/* Account Info */}
              <div>
                <div className="text-gray-700 font-medium mb-1">Account Info</div>
                <div className="text-gray-500 text-sm">Email: user@email.com</div>
                <div className="text-gray-500 text-sm">Username: demo_user</div>
              </div>
              <button className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition" onClick={() => setShowConfirm({ type: 'delete', open: true })}>Delete Account</button>
            </div>
          </div>
        </div>
      )}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowHelp(false)}>✕</button>
            <div className="text-xl font-bold mb-4">Help & Safety</div>
            <div className="space-y-4">
              <div className="text-gray-700 font-medium">Safety Tips</div>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                <li>Never share personal info too soon.</li>
                <li>Meet in public places for first dates.</li>
                <li>Report suspicious or inappropriate behavior.</li>
                <li>Trust your instincts and stay safe.</li>
              </ul>
              <div className="mt-4">
                <a href="mailto:support@cultureconnect.com" className="text-blue-600 hover:underline">Contact Support</a>
              </div>
              <button className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition" onClick={() => setShowConfirm({ type: 'report', open: true })}>Report / Block User</button>
            </div>
          </div>
        </div>
      )}
      {showFavorites && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowFavorites(false)}>✕</button>
            <div className="text-xl font-bold mb-4">Favorites</div>
            <div className="text-gray-700">Your saved profiles will appear here.</div>
          </div>
        </div>
      )}
      {showVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowVerification(false)}>✕</button>
            <div className="text-xl font-bold mb-4">Profile Verification</div>
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-green-500 text-2xl">✅</span>
                <span className="text-gray-700 font-medium">Get Verified for Extra Trust</span>
                {isVerified && <span className="ml-2 text-green-500 font-bold">Verified!</span>}
              </div>
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); setIsVerified(true); setShowConfirm({ type: 'verified', open: true }); }}>
                <label className="block text-gray-700 font-medium mb-1">Upload a selfie for verification:</label>
                <input type="file" accept="image/*" className="w-full border rounded-lg p-2" disabled title="Demo only" />
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition mt-2">Submit for Review</button>
              </form>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-green-500">✔️</span>
                <span className="text-gray-600 text-sm">Verified users get a badge and more matches!</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowEvents(false)}>✕</button>
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">📅 Events</div>
            <div className="text-gray-700 mb-2">Find and join local meetups, speed dating, or virtual events!</div>
            <ul className="list-disc list-inside text-gray-600 text-base space-y-2 mt-4">
              <li>Speed Dating Night – Friday 7pm (NYC)</li>
              <li>Virtual Game Night – Saturday 8pm (Online)</li>
              <li>Singles Mixer – Next Week (LA)</li>
            </ul>
            <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition" onClick={() => setShowCreateEvent(true)}>Create Event</button>
          </div>
        </div>
      )}
      {showCreateEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowCreateEvent(false)}>✕</button>
            <div className="text-xl font-bold mb-4">Create Event</div>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); setShowCreateEvent(false); setShowActionConfirm({ type: 'event', open: true }); }}>
              <input className="w-full border rounded-lg p-2" placeholder="Event Name" required />
              <input className="w-full border rounded-lg p-2" placeholder="Location" required />
              <input className="w-full border rounded-lg p-2" placeholder="Date & Time" required />
              <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition">Submit</button>
            </form>
          </div>
        </div>
      )}
      {showExplore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowExplore(false)}>✕</button>
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">🧭 Explore</div>
            <div className="text-gray-700 mb-2">Browse trending users, new members, and curated picks!</div>
            <ul className="list-disc list-inside text-gray-600 text-base space-y-2 mt-4">
              <li>Trending: Alex, Priya, Sam</li>
              <li>New: Jamie, Taylor, Chris</li>
              <li>Curated: “Most Compatible”</li>
            </ul>
            <button className="mt-6 w-full bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-600 transition" onClick={() => setShowExplorePrompt(true)}>See More</button>
          </div>
        </div>
      )}
      {showExplorePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative text-center">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowExplorePrompt(false)}>✕</button>
            <div className="text-xl font-bold mb-4">Explore More</div>
            <div className="text-gray-700 mb-6">More trending and new users coming soon!</div>
            <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition" onClick={() => setShowExplorePrompt(false)}>OK</button>
          </div>
        </div>
      )}
      {showIcebreakers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowIcebreakers(false)}>✕</button>
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">✨ Icebreakers</div>
            <div className="text-gray-700 mb-2">Fun questions and games to start a conversation!</div>
            <ul className="list-disc list-inside text-gray-600 text-base space-y-2 mt-4">
              <li>{icebreakerPrompts[icebreakerIndex]}</li>
            </ul>
            <button className="mt-6 w-full bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition" onClick={() => setIcebreakerIndex(i => (i + 1) % icebreakerPrompts.length)}>Get Another</button>
          </div>
        </div>
      )}
      {showStories && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowStories(false)}>✕</button>
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">💖 Success Stories</div>
            <div className="text-gray-700 mb-2">Read real stories from couples who met on CultureConnect!</div>
            <ul className="list-disc list-inside text-gray-600 text-base space-y-2 mt-4">
              <li>“We met at a virtual event and now we’re engaged!”</li>
              <li>“Our first date was a cooking class—now we travel the world together.”</li>
              <li>“We bonded over our love of music and food!”</li>
            </ul>
            <button className="mt-6 w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition" onClick={() => setShowShareStory(true)}>Share Your Story</button>
          </div>
        </div>
      )}
      {showShareStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowShareStory(false)}>✕</button>
            <div className="text-xl font-bold mb-4">Share Your Story</div>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); setShowShareStory(false); setShowActionConfirm({ type: 'story', open: true }); }}>
              <input className="w-full border rounded-lg p-2" placeholder="Your Name(s)" required />
              <textarea className="w-full border rounded-lg p-2" placeholder="Your Story" rows={4} required />
              <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition">Submit</button>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {showConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative text-center">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowConfirm({ type: '', open: false })}>✕</button>
            {showConfirm.type === 'delete' && <>
              <div className="text-xl font-bold mb-4 text-red-600">Delete Account</div>
              <div className="text-gray-700 mb-6">Are you sure you want to delete your account? This cannot be undone.</div>
              <button className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition" onClick={() => { setShowConfirm({ type: '', open: false }); alert('Account deleted! (Demo)'); }}>Yes, Delete</button>
            </>}
            {showConfirm.type === 'logout' && <>
              <div className="text-xl font-bold mb-4">Logout</div>
              <div className="text-gray-700 mb-6">Are you sure you want to log out?</div>
              <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition" onClick={() => { setShowConfirm({ type: '', open: false }); alert('Logged out! (Demo)'); }}>Logout</button>
            </>}
            {showConfirm.type === 'report' && <>
              <div className="text-xl font-bold mb-4 text-red-600">Report / Block User</div>
              <div className="text-gray-700 mb-6">User has been reported/blocked. Thank you for helping keep the community safe!</div>
              <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition" onClick={() => setShowConfirm({ type: '', open: false })}>OK</button>
            </>}
            {showConfirm.type === 'verified' && <>
              <div className="text-xl font-bold mb-4 text-green-600">Verification Submitted</div>
              <div className="text-gray-700 mb-6">Your verification is under review. You'll get a badge when approved!</div>
              <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition" onClick={() => setShowConfirm({ type: '', open: false })}>OK</button>
            </>}
          </div>
        </div>
      )}
      {/* Action Confirmation Modal for new features */}
      {showActionConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative text-center">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowActionConfirm({ type: '', open: false })}>✕</button>
            {showActionConfirm.type === 'event' && <>
              <div className="text-xl font-bold mb-4 text-blue-600">Event Created</div>
              <div className="text-gray-700 mb-6">Your event has been submitted and will appear soon!</div>
              <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition" onClick={() => setShowActionConfirm({ type: '', open: false })}>OK</button>
            </>}
            {showActionConfirm.type === 'story' && <>
              <div className="text-xl font-bold mb-4 text-green-600">Story Submitted</div>
              <div className="text-gray-700 mb-6">Thank you for sharing your story! It will inspire others.</div>
              <button className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition" onClick={() => setShowActionConfirm({ type: '', open: false })}>OK</button>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

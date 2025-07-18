import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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

// Remove NotificationDropdown and all api.notifications references

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

  // Live notifications

  const icebreakerPrompts = [
    "If you could travel anywhere, where would you go?",
    "What's your go-to karaoke song?",
    "Describe your perfect weekend.",
    "What's your favorite food to cook or eat?",
    "If you could have dinner with anyone, who would it be?",
    "What's a fun fact about you?"
  ];

  // 1. Reorder the tabs array as requested
  const tabs = [
    { id: "discover", label: "Discover", icon: "🔍" },
    { id: "matches", label: "Matches", icon: "💫" },
    { id: "friends", label: "Friends", icon: "👥" },
    { id: "conversations", label: "Messages", icon: "💬" },
    { id: "games", label: "Games", icon: "🎮" },
    { id: "kandi", label: "Kandi AI", icon: "🐶" },
    { id: "news", label: "News", icon: "📰" },
    { id: "stories", label: "Stories", icon: "📖" },
    { id: "events", label: "Events", icon: "📅", onClick: () => setShowEvents(true) },
    { id: "explore", label: "Explore", icon: "🧭" },
    { id: "community", label: "Community", icon: "🌐" },
  ];

  const userProfile = useQuery(api.profiles.getCurrentUserProfile);

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
        return <div className="p-8"><h2 className="text-3xl font-bold mb-4 text-white">Community</h2><div className="bg-white/10 rounded-2xl p-8 text-white/80">Community features coming soon! (Placeholder for improved layout)</div></div>;
      case "profile":
        return <ProfilePage />;
      case "explore":
        return <ExploreSection />;
      case "kandi":
        return <KandiChat />;
      case "events":
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-white">Events Near You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Example event cards (replace with real data later) */}
              {[{
                title: "Cultural Food Festival",
                date: "July 20, 2024",
                location: "Downtown Park",
                description: "Taste dishes from around the world and enjoy live performances!"
              }, {
                title: "Music & Dance Night",
                date: "July 22, 2024",
                location: "City Arts Center",
                description: "Join us for a night of music, dance, and cultural exchange."
              }, {
                title: "Language Exchange Meetup",
                date: "July 25, 2024",
                location: "Cafe Global",
                description: "Practice languages and make new friends in a fun, relaxed setting."
              }].map((event, i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-lg flex flex-col">
                  <div className="text-xl font-bold text-white mb-2">{event.title}</div>
                  <div className="text-white/80 mb-1">{event.date} • {event.location}</div>
                  <div className="text-white/70 mb-2">{event.description}</div>
                  <button className="mt-auto px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all">View Details</button>
                </div>
              ))}
            </div>
          </div>
        );
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
              {/* Notification Badge */}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white/95 rounded-2xl shadow-2xl border border-white/20 z-50 p-4">
                <div className="text-lg font-bold mb-2">Notifications</div>
                <div className="text-gray-600">No notifications yet.</div>
                <button className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all" onClick={() => setShowNotifications(false)}>Close</button>
              </div>
            )}
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
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("profile")}> 
              <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center border-2 border-white float-animation overflow-hidden">
                {userProfile?.profileImageUrl ? (
                  <img src={userProfile.profileImageUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
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
          {/* Main navigation - match mobile toolbar */}
          <nav className="flex flex-col space-y-2 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center space-x-3 py-3 px-4 rounded-xl transition text-left hover-lift ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg pulse-glow' : 'text-white/70 hover:text-white hover:bg-white/10 hover-scale'}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.onClick) tab.onClick();
                }}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          {/* Bottom section (optional: logout, verification, etc.) */}
          <div className="mt-auto pt-6 border-t border-white/20">
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

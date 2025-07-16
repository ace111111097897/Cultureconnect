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

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("discover");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showConfirm, setShowConfirm] = useState<{ type: string; open: boolean }>({ type: '', open: false });
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

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
    { id: "favorites", label: "Favorites", icon: "⭐", onClick: () => setShowFavorites(true) },
    { id: "notifications", label: "Notifications", icon: "🔔", onClick: () => setShowNotifications(true) },
    { id: "settings", label: "Settings", icon: "⚙️", onClick: () => setShowSettings(true) },
    { id: "help", label: "Help & Safety", icon: "🛡️", onClick: () => setShowHelp(true) },
    { id: "verification", label: "Verification", icon: "✅", onClick: () => setShowVerification(true) },
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
      case "profile":
        return <ProfilePage />;
      default:
        return <DiscoverSection />;
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-800 backdrop-blur-2xl${darkMode ? ' dark' : ''}`}>
      {/* Top Nav Bar */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white/10 backdrop-blur-md items-center px-4 z-40 shadow-lg">
        <div className="text-2xl font-bold text-white tracking-wide mr-8 cursor-pointer" onClick={() => setActiveTab('profile')}>
          CultureConnect
        </div>
        <div className="flex-1 flex items-center">
          <input
            type="text"
            placeholder="Search CultureConnect..."
            className="w-full max-w-md px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-center space-x-4 ml-8">
          <button className="text-white/80 hover:text-white text-xl">🔔</button>
          <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition" onClick={() => setActiveTab('profile')} title="Go to Profile">
            <span className="text-2xl">👤</span>
          </button>
        </div>
      </header>
      {/* Mobile Top Toolbar and Sidebar */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-30 bg-white/10 backdrop-blur-md flex overflow-x-auto whitespace-nowrap scrollbar-hide py-2 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 mx-1 rounded-xl font-medium transition-all flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-1 pt-16 md:pt-16 min-h-[calc(100vh-4rem)]" style={{ paddingTop: '4rem' }}>
        {/* Left Sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-white/10 backdrop-blur-md border-r border-white/10 py-6 px-2 space-y-2 min-h-screen justify-between">
          <div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={tab.onClick ? tab.onClick : () => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all text-lg w-full text-left ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === 'verification' && isVerified && <span className="ml-2 text-green-500">✔️</span>}
              </button>
            ))}
          </div>
          {/* Logout at the bottom */}
          <button
            onClick={() => setShowConfirm({ type: 'logout', open: true })}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all text-lg w-full text-left text-red-400 hover:text-red-600 hover:bg-white/10 mt-8"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </aside>
        {/* Main Content Area */}
        <main className="flex-1 p-2 sm:p-4 md:p-8 w-full min-h-[calc(100vh-4rem)]">
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
      {/* Modals/Panels for new sidebar items */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowNotifications(false)}>✕</button>
            <div className="text-xl font-bold mb-4">Notifications</div>
            <div className="text-gray-700">No new notifications yet.</div>
          </div>
        </div>
      )}
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
    </div>
  );
}

import React, { ReactNode } from "react";

interface FacebookLayoutProps {
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  children: ReactNode;
}

const navItems = [
  { label: "Discover", icon: "travel_explore" },
  { label: "Matches", icon: "favorite" },
  { label: "Friends", icon: "group" },
  { label: "Messages", icon: "chat" },
  { label: "Games", icon: "sports_esports" },
  { label: "News", icon: "newspaper" },
  { label: "Stories", icon: "auto_stories" },
  { label: "Community", icon: "diversity_3" },
  { label: "Feedback", icon: "feedback" },
  { label: "Profile", icon: "account_circle" },
];

export default function FacebookLayout({
  leftSidebar,
  rightSidebar,
  children,
}: FacebookLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-purple-900 via-purple-700 to-orange-400">
      {/* Mobile Top Navigation Bar (Horizontal Scroll) */}
      <nav className="md:hidden sticky top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur shadow flex items-center overflow-x-auto no-scrollbar px-2 h-14">
        <div className="flex gap-2 w-full">
          {navItems.map((item) => (
            <button
              key={item.label}
              className="flex flex-col items-center justify-center px-3 py-1 text-primary hover:bg-primary/10 rounded-lg transition min-w-[60px]"
              title={item.label}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {/* Desktop Top Navigation Bar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur shadow z-30 items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <span className="font-bold text-xl text-primary cursor-pointer select-none">Culture</span>
          <span className="ml-2 text-lg font-semibold text-primary/80">Connect</span>
        </div>
        <div className="flex-1 flex justify-center">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search CultureConnect..."
            className="rounded-full px-4 py-1 bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 w-64 max-w-xs text-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              className="hover:bg-primary/10 p-2 rounded-full transition"
              title={item.label}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
            </button>
          ))}
        </div>
      </nav>
      {/* Main Layout */}
      <div className="flex flex-1 pt-14 w-full max-w-[1600px] mx-auto">
        {/* Left Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white/70 border-r border-gray-200 min-h-[calc(100vh-56px)] pt-4 px-2 gap-2">
          {leftSidebar}
        </aside>
        {/* Main Content */}
        <main className="flex-1 min-w-0 px-2 py-4 md:px-8 flex flex-col gap-4">
          {children}
        </main>
        {/* Right Sidebar */}
        {rightSidebar && (
          <aside className="hidden lg:flex flex-col w-72 bg-white/70 border-l border-gray-200 min-h-[calc(100vh-56px)] pt-4 px-2 gap-2">
            {rightSidebar}
          </aside>
        )}
      </div>
    </div>
  );
} 
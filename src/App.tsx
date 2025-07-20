import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { ProfileSetup } from "./components/ProfileSetup";
import { Dashboard } from "./components/Dashboard";

// Particle component for animated background
function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 6,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-orange-600 gradient-animation">
      <FloatingParticles />
      <div className="min-h-screen bg-black/20 backdrop-blur-sm relative">
        <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 slide-in-top">
          <div className="w-full px-4 sm:px-4 h-16 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full pulse-glow"></div>
              <h1 className="text-2xl font-bold text-white typing-animation">Culture</h1>
            </div>
            <Authenticated>
              <HeaderNotifications />
              <SignOutButton />
            </Authenticated>
          </div>
        </header>

        <main className="w-full px-4 sm:px-4 py-6 sm:py-8">
          <Content />
        </main>
        
        <Toaster />
      </div>
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);

  if (loggedInUser === undefined || userProfile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white spin-smooth"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Unauthenticated>
        <div className="text-center space-y-6">
          <div className="space-y-4 slide-in-bottom">
            <h1 className="text-6xl font-bold text-white mb-4">
              Connect Through
              <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent glitch"> Culture</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto fade-in">
              Build meaningful relationships through shared identity, values, and lived experiences. 
              Go beyond swiping with our Cultural Match Journey.
            </p>
          </div>
          
          <div className="max-w-md mx-auto scale-in">
            <SignInForm />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover-lift float-animation">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl mb-4 flex items-center justify-center bounce-gentle">
                <span className="text-white text-xl">🌍</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Cultural Matching</h3>
              <p className="text-white/70">Connect with people who share your heritage, traditions, and values.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover-lift float-animation-delayed">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl mb-4 flex items-center justify-center bounce-gentle">
                <span className="text-white text-xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Meaningful Conversations</h3>
              <p className="text-white/70">Share cultural stories and engage in deeper discussions.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover-lift float-animation-slow">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl mb-4 flex items-center justify-center bounce-gentle">
                <span className="text-white text-xl">🎉</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Cultural Events</h3>
              <p className="text-white/70">Join group activities around food, music, language, and traditions.</p>
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {!userProfile ? (
          <div className="slide-in-bottom">
          <ProfileSetup />
          </div>
        ) : (
          <div className="fade-in">
          <Dashboard />
          </div>
        )}
      </Authenticated>
    </div>
  );
}

function HeaderNotifications() {
  const friendRequests = useQuery(api.friends.getFriendRequests);
  
  if (!friendRequests || friendRequests.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4 mr-4">
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold hover-scale cursor-pointer">
          🔔
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center pulse-glow">
          <span className="text-white text-xs font-bold">
            {friendRequests.length > 99 ? '99+' : friendRequests.length}
          </span>
        </div>
      </div>
      
      {/* Friend request indicator */}
      <div className="relative">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
          📨
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {friendRequests.length > 9 ? '9+' : friendRequests.length}
          </span>
        </div>
      </div>
      
      {/* Message notification indicator */}
      <div className="relative">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
          💬
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">3</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";

export function GamesSection() {
  // Remove all state and logic related to lobbies and history

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 rounded-xl font-medium transition-all bg-gradient-to-r from-orange-500 to-pink-500 text-white"
              disabled
            >
              🎮 UNO
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-12">
        <div className="text-6xl mb-4">🎴</div>
        <h3 className="text-2xl font-bold text-white mb-2">UNO - Coming Soon!</h3>
        <p className="text-white/70 max-w-xl text-center mb-6">
          Get ready for the classic card game with a twist! Soon you'll be able to challenge friends, join public lobbies, and climb the leaderboard in UNO. Stay tuned for the launch and prepare your best strategies!
        </p>
        <div className="bg-white/10 rounded-xl p-4 border border-white/20 text-white/80 text-center max-w-md">
          <strong>Game Prompt:</strong> <br />
          "Can you outwit your friends and be the first to shout UNO? Prepare for wild cards, sneaky skips, and epic reversals!"
        </div>
      </div>
    </div>
  );
}

export default GamesSection;

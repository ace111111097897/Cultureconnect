import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

export function GamesSection() {
  const [view, setView] = useState<"menu" | "game">("menu");

  if (view === "game") {
    return (
      <div className="space-y-8 p-4 md:p-0">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">🎮 UNO Game</h2>
            <button
              onClick={() => setView("menu")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              ← Back to Menu
            </button>
          </div>
          <iframe 
            src="https://cardgames.io/uno/" 
            width="100%" 
            height="700px" 
            frameBorder="0"
            className="rounded-lg"
            title="UNO Game">
          </iframe>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-0">
      {/* Header */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-2 border border-white/20">
          <div className="flex space-x-2">
            <button className="px-6 py-3 md:px-4 md:py-2 rounded-xl font-medium transition-all bg-gradient-to-r from-orange-500 to-pink-500 text-white">
              🎮 UNO
            </button>
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">How to Play UNO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/80">
          <div>
            <h4 className="font-semibold text-white mb-2">🎯 Objective</h4>
            <p>Be the first player to get rid of all your cards by matching colors or numbers with the top card on the discard pile.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">🎴 Special Cards</h4>
            <ul className="space-y-1 text-sm">
              <li>• <span className="text-red-400">Skip:</span> Next player loses their turn</li>
              <li>• <span className="text-blue-400">Reverse:</span> Changes direction of play</li>
              <li>• <span className="text-green-400">Draw 2:</span> Next player draws 2 cards</li>
              <li>• <span className="text-purple-400">Wild:</span> Choose any color</li>
              <li>• <span className="text-purple-400">Wild +4:</span> Choose color + next player draws 4</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Start Game Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setView("game")}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all text-lg"
        >
          🎮 Start UNO Game
        </button>
      </div>

      {/* Additional Info */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Game Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80">
          <div className="text-center">
            <div className="text-3xl mb-2">👥</div>
            <h4 className="font-semibold text-white">Multiplayer</h4>
            <p className="text-sm">Play with friends online</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🎨</div>
            <h4 className="font-semibold text-white">Beautiful UI</h4>
            <p className="text-sm">Clean and intuitive interface</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-semibold text-white">Fast Gameplay</h4>
            <p className="text-sm">Quick and responsive</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamesSection;

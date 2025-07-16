import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// UNO Card component
function UnoCard({ card, onClick, isPlayable, isSelected }: { 
  card: string; 
  onClick?: () => void; 
  isPlayable?: boolean;
  isSelected?: boolean;
}) {
  const getCardColor = (card: string) => {
    if (card.startsWith("wild")) return "purple";
    return card.split("_")[0];
  };

  const getCardValue = (card: string) => {
    if (card.startsWith("wild")) return "WILD";
    if (card.includes("skip")) return "SKIP";
    if (card.includes("reverse")) return "REV";
    if (card.includes("draw2")) return "+2";
    if (card.includes("wildDraw4")) return "+4";
    return card.split("_")[1];
  };

  const getCardSymbol = (card: string) => {
    if (card.includes("skip")) return "⊘";
    if (card.includes("reverse")) return "↻";
    if (card.includes("draw2")) return "+2";
    if (card.includes("wildDraw4")) return "+4";
    if (card.startsWith("wild")) return "★";
    return getCardValue(card);
  };

  const color = getCardColor(card);
  const value = getCardValue(card);
  const symbol = getCardSymbol(card);

  const colorClasses = {
    red: "bg-red-500 border-red-600",
    blue: "bg-blue-500 border-blue-600", 
    green: "bg-green-500 border-green-600",
    yellow: "bg-yellow-400 border-yellow-500",
    purple: "bg-gradient-to-br from-purple-500 to-pink-500 border-purple-600"
  };

  return (
    <div
      className={`
        w-16 h-24 rounded-lg border-2 shadow-lg cursor-pointer transition-all duration-200
        ${colorClasses[color as keyof typeof colorClasses] || "bg-gray-500"}
        ${isPlayable ? "hover:scale-110 hover:shadow-xl" : "opacity-50 cursor-not-allowed"}
        ${isSelected ? "ring-4 ring-yellow-300 scale-110" : ""}
        text-white font-bold text-center flex flex-col justify-center
      `}
      onClick={isPlayable ? onClick : undefined}
    >
      <div className="text-lg font-bold">{symbol}</div>
      {card.startsWith("wild") && (
        <div className="text-xs mt-1">WILD</div>
      )}
    </div>
  );
}

// Lobby component
function UnoLobby({ lobby, onJoin, onLeave, onStart, isHost }: {
  lobby: any;
  onJoin: () => void;
  onLeave: () => void;
  onStart: () => void;
  isHost: boolean;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">{lobby.name}</h3>
        <div className="text-white/70">
          {lobby.players.length}/{lobby.maxPlayers} players
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        {lobby.playerProfiles?.map((player: any) => (
          <div key={player.userId} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-sm">👤</span>
            </div>
            <span className="text-white">{player.displayName}</span>
            {lobby.hostId === player.userId && (
              <span className="text-yellow-400 text-sm">👑 Host</span>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2">
        {isHost ? (
          <>
            <button
              onClick={onStart}
              disabled={lobby.players.length < 2}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Start Game
            </button>
            <button
              onClick={onLeave}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
            >
              Leave
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onJoin}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
            >
              Join
            </button>
            <button
              onClick={onLeave}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
            >
              Leave
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Game component
function UnoGame({ gameId, onBack }: { gameId: Id<"unoGames">; onBack: () => void }) {
  const gameState = useQuery(api.games.getGameState, { gameId });
  const gameHistory = useQuery(api.games.getGameHistory, { gameId });
  const playCard = useMutation(api.games.playCard);
  const drawCard = useMutation(api.games.drawCard);
  const sayUno = useMutation(api.games.sayUno);
  
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");

  if (!gameState) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find((p: any) => p.isCurrentTurn);
  const isMyTurn = gameState.isCurrentPlayerTurn;
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];

  const canPlayCard = (card: string) => {
    if (!isMyTurn) return false;
    if (card.startsWith("wild")) return true;
    const [color, value] = card.split("_");
    return color === gameState.currentColor || value === gameState.currentValue;
  };

  const handlePlayCard = async (cardIndex: number) => {
    const card = gameState.currentPlayerHand[cardIndex];
    if (!canPlayCard(card)) return;

    if (card.startsWith("wild")) {
      setSelectedCardIndex(cardIndex);
      setShowColorPicker(true);
      return;
    }

    try {
      await playCard({ gameId, cardIndex });
      setSelectedCardIndex(null);
    } catch (error) {
      console.error("Error playing card:", error);
    }
  };

  const handleColorSelect = async (color: string) => {
    if (selectedCardIndex === null) return;
    
    try {
      await playCard({ gameId, cardIndex: selectedCardIndex, newColor: color });
      setSelectedCardIndex(null);
      setShowColorPicker(false);
      setSelectedColor("");
    } catch (error) {
      console.error("Error playing wild card:", error);
    }
  };

  const handleDrawCard = async () => {
    if (!isMyTurn) return;
    
    try {
      await drawCard({ gameId });
    } catch (error) {
      console.error("Error drawing card:", error);
    }
  };

  const handleSayUno = async () => {
    if (gameState.currentPlayerHand.length !== 1) return;
    
    try {
      await sayUno({ gameId });
    } catch (error) {
      console.error("Error saying UNO:", error);
    }
  };

  if (gameState.gameStatus === "finished") {
    const winner = gameState.players.find((p: any) => p.userId === gameState.winnerId);
    return (
      <div className="text-center space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
          <p className="text-xl text-white/80 mb-6">
            {winner?.displayName || "Unknown Player"} wins!
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Back to Lobbies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">UNO Game</h2>
            <p className="text-white/70">
              Current Color: <span className="font-bold" style={{ color: gameState.currentColor }}>{gameState.currentColor.toUpperCase()}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/70">Current Turn:</p>
            <p className="text-white font-semibold">{currentPlayer?.displayName || "Unknown"}</p>
          </div>
        </div>
      </div>

      {/* Top Card */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-white font-semibold mb-4 text-center">Top Card</h3>
          <UnoCard card={topCard} />
        </div>
      </div>

      {/* Other Players */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-4">Other Players</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gameState.players.map((player: any, index: number) => (
            <div key={player.userId} className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-2">
                <span className="text-white">👤</span>
              </div>
              <p className="text-white font-medium text-sm">{player.displayName}</p>
              <p className="text-white/70 text-xs">{player.hand.length} cards</p>
              {player.isCurrentTurn && (
                <div className="text-yellow-400 text-sm mt-1">🎯 Current Turn</div>
              )}
              {player.hasSaidUno && (
                <div className="text-green-400 text-sm mt-1">UNO!</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* My Hand */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">My Hand ({gameState.currentPlayerHand.length} cards)</h3>
          {isMyTurn && (
            <div className="text-green-400 font-semibold">🎯 Your Turn!</div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {gameState.currentPlayerHand.map((card: string, index: number) => (
            <UnoCard
              key={index}
              card={card}
              isPlayable={canPlayCard(card)}
              isSelected={selectedCardIndex === index}
              onClick={() => handlePlayCard(index)}
            />
          ))}
        </div>

        {isMyTurn && (
          <div className="flex space-x-2">
            <button
              onClick={handleDrawCard}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
            >
              Draw Card
            </button>
            {gameState.currentPlayerHand.length === 1 && (
              <button
                onClick={handleSayUno}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-all"
              >
                Say UNO!
              </button>
            )}
          </div>
        )}
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">Choose Color</h3>
            <div className="grid grid-cols-2 gap-4">
              {["red", "blue", "green", "yellow"].map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`p-4 rounded-lg font-bold text-white transition-all hover:scale-105 ${
                    color === "red" ? "bg-red-500" :
                    color === "blue" ? "bg-blue-500" :
                    color === "green" ? "bg-green-500" :
                    "bg-yellow-400"
                  }`}
                >
                  {color.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowColorPicker(false);
                setSelectedCardIndex(null);
              }}
              className="w-full mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Game History */}
      {gameHistory && gameHistory.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-white font-semibold mb-4">Game History</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {gameHistory.map((action: any, index: number) => (
              <div key={index} className="text-white/70 text-sm">
                {action.actionType === "play_card" && (
                  <span>🎴 {action.playerId} played {action.cardPlayed}</span>
                )}
                {action.actionType === "draw_card" && (
                  <span>📥 {action.playerId} drew a card</span>
                )}
                {action.actionType === "say_uno" && (
                  <span>🎯 {action.playerId} said UNO!</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function GamesSection() {
  const [view, setView] = useState<"lobbies" | "create" | "game">("lobbies");
  const [selectedLobby, setSelectedLobby] = useState<any>(null);
  const [currentGameId, setCurrentGameId] = useState<Id<"unoGames"> | null>(null);
  const [lobbyName, setLobbyName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  
  const lobbies = useQuery(api.games.getActiveLobbies);
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);
  
  const createLobby = useMutation(api.games.createLobby);
  const joinLobby = useMutation(api.games.joinLobby);
  const leaveLobby = useMutation(api.games.leaveLobby);
  const startGame = useMutation(api.games.startGame);

  const handleCreateLobby = async () => {
    if (!lobbyName.trim()) return;
    
    try {
      const lobbyId = await createLobby({ name: lobbyName, maxPlayers });
      setView("lobbies");
      setLobbyName("");
    } catch (error) {
      console.error("Error creating lobby:", error);
    }
  };

  const handleJoinLobby = async (lobby: any) => {
    try {
      await joinLobby({ lobbyId: lobby._id });
      setSelectedLobby(lobby);
    } catch (error) {
      console.error("Error joining lobby:", error);
    }
  };

  const handleLeaveLobby = async (lobby: any) => {
    try {
      await leaveLobby({ lobbyId: lobby._id });
      setSelectedLobby(null);
    } catch (error) {
      console.error("Error leaving lobby:", error);
    }
  };

  const handleStartGame = async (lobby: any) => {
    try {
      const gameId = await startGame({ lobbyId: lobby._id });
      setCurrentGameId(gameId);
      setView("game");
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const isInLobby = (lobby: any) => {
    return lobby.players.includes(userProfile?.userId);
  };

  const isHost = (lobby: any) => {
    return lobby.hostId === userProfile?.userId;
  };

  if (view === "game" && currentGameId) {
    return (
      <UnoGame 
        gameId={currentGameId} 
        onBack={() => {
          setView("lobbies");
          setCurrentGameId(null);
        }} 
      />
    );
  }

  if (view === "create") {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Create UNO Lobby</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Lobby Name</label>
              <input
                type="text"
                value={lobbyName}
                onChange={(e) => setLobbyName(e.target.value)}
                placeholder="Enter lobby name..."
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Max Players</label>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num} players</option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleCreateLobby}
                disabled={!lobbyName.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Create Lobby
              </button>
              <button
                onClick={() => setView("lobbies")}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 rounded-xl font-medium transition-all bg-gradient-to-r from-orange-500 to-pink-500 text-white"
            >
              🎮 UNO
            </button>
          </div>
        </div>
      </div>

      {/* Create Lobby Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setView("create")}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          Create New Lobby
        </button>
      </div>

      {/* Lobbies List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white text-center">Active Lobbies</h2>
        
        {!lobbies ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
          </div>
        ) : lobbies.length === 0 ? (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎴</div>
            <h3 className="text-xl font-bold text-white">No active lobbies</h3>
            <p className="text-white/70">Create a new lobby to start playing UNO!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {lobbies.map((lobby) => (
              <UnoLobby
                key={lobby._id}
                lobby={lobby}
                isHost={isHost(lobby)}
                onJoin={() => handleJoinLobby(lobby)}
                onLeave={() => handleLeaveLobby(lobby)}
                onStart={() => handleStartGame(lobby)}
              />
            ))}
          </div>
        )}
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
    </div>
  );
}

export default GamesSection;

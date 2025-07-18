import { useState, useEffect, useCallback } from "react";
import { Id } from "../../convex/_generated/dataModel";

// Confetti Component
function Confetti() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-bounce"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: '3s',
          }}
        />
      ))}
    </div>
  );
}

// UNO! Popup Component
function UnoPopup({ show, onClose, playerName }: { show: boolean; onClose: () => void; playerName: string }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      <Confetti />
      <div className="fixed inset-0 z-40 flex items-center justify-center">
        <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 p-8 rounded-3xl shadow-2xl scale-in">
          <div className="text-center">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-6xl font-bold text-white mb-2 glitch">UNO!</h1>
            <p className="text-xl text-white/90">{playerName} has 1 card left!</p>
          </div>
        </div>
      </div>
    </>
  );
}

// UNO Card Component
function UnoCard({ card, onClick, isPlayable, isSelected, isFaceDown = false }: { 
  card: string; 
  onClick?: () => void; 
  isPlayable?: boolean;
  isSelected?: boolean;
  isFaceDown?: boolean;
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

  if (isFaceDown) {
    return (
      <div className="w-16 h-24 rounded-lg border-2 shadow-lg bg-gradient-to-br from-blue-600 to-blue-800 border-blue-700 text-white font-bold text-center flex flex-col justify-center">
        <div className="text-lg font-bold">UNO</div>
        <div className="text-xs mt-1">CARD</div>
      </div>
    );
  }

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

// Player Component
function Player({ player, isCurrentTurn, isAI = false, onCardPlayed }: {
  player: { id: number; name: string; hand: string[]; isCurrentTurn: boolean };
  isCurrentTurn: boolean;
  isAI?: boolean;
  onCardPlayed?: (card: string, color?: string) => void;
}) {
  const [isThinking, setIsThinking] = useState(false);

  // AI thinking and playing logic
  useEffect(() => {
    if (isAI && isCurrentTurn && !isThinking) {
      setIsThinking(true);
      
      // Simulate AI thinking time
      const thinkingTime = 1500 + Math.random() * 1000;
      
      setTimeout(() => {
        if (onCardPlayed) {
          // Simple AI logic - play first playable card or draw
          const playableCards = player.hand.filter(card => {
            // For now, play any card (simplified logic)
            return true;
          });
          
          if (playableCards.length > 0) {
            const cardToPlay = playableCards[0];
            if (cardToPlay.startsWith("wild")) {
              const colors = ["red", "blue", "green", "yellow"];
              const chosenColor = colors[Math.floor(Math.random() * colors.length)];
              onCardPlayed(cardToPlay, chosenColor);
            } else {
              onCardPlayed(cardToPlay);
            }
          } else {
            onCardPlayed("draw");
          }
        }
        setIsThinking(false);
      }, thinkingTime);
    }
  }, [isAI, isCurrentTurn, player.hand, onCardPlayed, isThinking]);

  return (
    <div className="text-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
        isAI ? "bg-gradient-to-r from-yellow-300 to-pink-300" : "bg-gradient-to-r from-purple-500 to-pink-500"
      }`}>
        <span className={`text-xl ${isAI ? "text-black" : "text-white"}`}>
          {isAI ? "🐕" : "👤"}
        </span>
      </div>
      <p className="text-white font-medium text-sm">{player.name}</p>
      <p className="text-white/70 text-xs">{player.hand.length} cards</p>
      {isCurrentTurn && (
        <div className="text-yellow-400 text-sm mt-1">
          {isThinking ? "🤔 Thinking..." : "🎯 Current Turn"}
        </div>
      )}
    </div>
  );
}

// Live UNO Game Component
function LiveUnoGame({ onBack, gameMode }: { onBack: () => void; gameMode: "ai" | "multiplayer" }) {
  const [gameState, setGameState] = useState({
    players: [
      { id: 1, name: "You", hand: [] as string[], isCurrentTurn: true },
      { id: 2, name: gameMode === "ai" ? "Kandi AI" : "Player 2", hand: [] as string[], isCurrentTurn: false },
      { id: 3, name: "Player 3", hand: [] as string[], isCurrentTurn: false }
    ],
    discardPile: [] as string[],
    currentColor: "red",
    currentValue: "5",
    direction: 1, // 1 for clockwise, -1 for counter-clockwise
    gameStatus: "playing" as "playing" | "finished",
    deck: [] as string[],
    lastPlayedCard: null as string | null
  });

  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showUnoPopup, setShowUnoPopup] = useState(false);
  const [unoPlayer, setUnoPlayer] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<string[]>([]);

  const currentPlayer = gameState.players.find(p => p.isCurrentTurn);
  const isMyTurn = currentPlayer?.id === 1;

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Create deck
    const colors = ["red", "blue", "green", "yellow"];
    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const specials = ["skip", "reverse", "draw2"];
    
    let deck: string[] = [];
    
    // Add number cards (2 of each except 0)
    colors.forEach(color => {
      numbers.forEach(number => {
        const count = number === "0" ? 1 : 2;
        for (let i = 0; i < count; i++) {
          deck.push(`${color}_${number}`);
        }
      });
    });
    
    // Add special cards (2 of each)
    colors.forEach(color => {
      specials.forEach(special => {
        deck.push(`${color}_${special}`);
        deck.push(`${color}_${special}`);
      });
    });
    
    // Add wild cards (4 of each)
    for (let i = 0; i < 4; i++) {
      deck.push("wild");
      deck.push("wildDraw4");
    }
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Deal cards
    const players = gameState.players.map(player => ({
      ...player,
      hand: deck.splice(0, 7)
    }));
    
    // Set first card
    const firstCard = deck.splice(0, 1)[0];
    
    setGameState({
      players,
      discardPile: [firstCard],
      currentColor: firstCard.split("_")[0],
      currentValue: firstCard.split("_")[1],
      direction: 1,
      gameStatus: "playing",
      deck,
      lastPlayedCard: firstCard
    });

    addToHistory(`Game started! First card: ${firstCard}`);
  };

  const addToHistory = (message: string) => {
    setGameHistory(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const canPlayCard = useCallback((card: string) => {
    if (!isMyTurn) return false;
    if (card.startsWith("wild")) return true;
    const [color, value] = card.split("_");
    return color === gameState.currentColor || value === gameState.currentValue;
  }, [isMyTurn, gameState.currentColor, gameState.currentValue]);

  const checkUno = useCallback((playerId: number) => {
    const player = gameState.players.find(p => p.id === playerId);
    if (player && player.hand.length === 1) {
      setUnoPlayer(player.name);
      setShowUnoPopup(true);
      addToHistory(`${player.name} has UNO!`);
    }
  }, [gameState.players]);

  const getNextPlayerIndex = useCallback(() => {
    const currentIndex = gameState.players.findIndex(p => p.isCurrentTurn);
    return (currentIndex + gameState.direction + gameState.players.length) % gameState.players.length;
  }, [gameState.players, gameState.direction]);

  const moveToNextTurn = useCallback(() => {
    const nextIndex = getNextPlayerIndex();
    setGameState(prev => ({
      ...prev,
      players: prev.players.map((p, index) => ({
        ...p,
        isCurrentTurn: index === nextIndex
      }))
    }));
    
    const nextPlayer = gameState.players[nextIndex];
    addToHistory(`${nextPlayer.name}'s turn`);
  }, [getNextPlayerIndex, gameState.players]);

  const handlePlayCard = useCallback((cardIndex: number) => {
    const card = currentPlayer?.hand[cardIndex];
    if (!card || !canPlayCard(card)) return;

    if (card.startsWith("wild")) {
      setSelectedCard(cardIndex);
      setShowColorPicker(true);
      return;
    }

    playCard(card);
  }, [currentPlayer, canPlayCard]);

  const playCard = useCallback((card: string, chosenColor?: string) => {
    if (!currentPlayer) return;

    const newHand = currentPlayer.hand.filter(c => c !== card);
    const newDiscardPile = [...gameState.discardPile, card];
    
    let newCurrentColor = chosenColor || card.split("_")[0];
    let newCurrentValue = card.split("_")[1];
    
    // Handle special cards
    if (card.includes("skip")) {
      addToHistory(`${currentPlayer.name} played SKIP - skipping next player`);
    } else if (card.includes("reverse")) {
      setGameState(prev => ({ ...prev, direction: -prev.direction }));
      addToHistory(`${currentPlayer.name} played REVERSE - direction changed`);
    } else if (card.includes("draw2")) {
      addToHistory(`${currentPlayer.name} played +2 - next player draws 2 cards`);
    } else if (card.startsWith("wild")) {
      addToHistory(`${currentPlayer.name} played WILD and chose ${newCurrentColor}`);
      newCurrentValue = "wild";
    }
    
    // Check for UNO
    checkUno(currentPlayer.id);
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === currentPlayer.id ? { ...p, hand: newHand, isCurrentTurn: false } : p
      ),
      discardPile: newDiscardPile,
      currentColor: newCurrentColor,
      currentValue: newCurrentValue,
      lastPlayedCard: card
    }));

    addToHistory(`${currentPlayer.name} played ${card}`);

    // Check for game end
    if (newHand.length === 0) {
      setTimeout(() => {
        setGameState(prev => ({ ...prev, gameStatus: "finished" }));
        addToHistory(`🎉 ${currentPlayer.name} won the game!`);
        alert(`🎉 Congratulations! ${currentPlayer.name} won!`);
        onBack();
      }, 1000);
      return;
    }

    // Move to next turn
    setTimeout(() => {
      moveToNextTurn();
    }, 1000);
  }, [currentPlayer, gameState.discardPile, gameState.direction, checkUno, moveToNextTurn, addToHistory, onBack]);

  const handleColorSelect = useCallback((color: string) => {
    if (selectedCard === null || !currentPlayer) return;
    
    const card = currentPlayer.hand[selectedCard];
    if (!card) return;

    playCard(card, color);
    setSelectedCard(null);
    setShowColorPicker(false);
  }, [selectedCard, currentPlayer, playCard]);

  const handleDrawCard = useCallback(() => {
    if (!isMyTurn || !currentPlayer) return;
    
    if (gameState.deck.length > 0) {
      const drawnCard = gameState.deck[0];
      const newHand = [...currentPlayer.hand, drawnCard];
      
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === 1 ? { ...p, hand: newHand, isCurrentTurn: false } : p
        ),
        deck: prev.deck.slice(1)
      }));

      addToHistory(`${currentPlayer.name} drew a card`);
      
      setTimeout(() => {
        moveToNextTurn();
      }, 1000);
    }
  }, [isMyTurn, currentPlayer, gameState.deck, moveToNextTurn, addToHistory]);

  const handleAICardPlayed = useCallback((card: string, color?: string) => {
    playCard(card, color);
  }, [playCard]);

  return (
    <div className="space-y-6 p-4">
      {/* Game Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Live UNO vs {gameMode === "ai" ? "Kandi AI" : "Players"}</h2>
            <p className="text-white/70">
              Current Color: <span className="font-bold" style={{ color: gameState.currentColor }}>{gameState.currentColor.toUpperCase()}</span>
            </p>
            <p className="text-white/50 text-sm">Cards in deck: {gameState.deck.length}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70">Current Turn:</p>
            <p className="text-white font-semibold">{currentPlayer?.name || "Unknown"}</p>
            <p className="text-white/50 text-sm">Direction: {gameState.direction === 1 ? "↻" : "↺"}</p>
          </div>
        </div>
      </div>

      {/* Top Card */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-white font-semibold mb-4 text-center">Top Card</h3>
          <UnoCard card={gameState.discardPile[gameState.discardPile.length - 1]} />
        </div>
      </div>

      {/* Other Players */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-4">Other Players</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gameState.players.filter(p => p.id !== 1).map((player) => (
            <Player
              key={player.id}
              player={player}
              isCurrentTurn={player.isCurrentTurn}
              isAI={gameMode === "ai" && player.id === 2}
              onCardPlayed={handleAICardPlayed}
            />
          ))}
        </div>
      </div>

      {/* My Hand */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">My Hand ({currentPlayer?.hand.length || 0} cards)</h3>
          {isMyTurn && (
            <div className="text-green-400 font-semibold animate-pulse">🎯 Your Turn!</div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {currentPlayer?.hand.map((card: string, index: number) => (
            <UnoCard
              key={index}
              card={card}
              isPlayable={canPlayCard(card)}
              isSelected={selectedCard === index}
              onClick={() => handlePlayCard(index)}
            />
          ))}
        </div>

        {isMyTurn && (
          <div className="flex space-x-2">
            <button
              onClick={handleDrawCard}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all hover-scale"
            >
              Draw Card
            </button>
          </div>
        )}
      </div>

      {/* Game History */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <h3 className="text-white font-semibold mb-2">Game History</h3>
        <div className="max-h-32 overflow-y-auto text-white/70 text-sm space-y-1">
          {gameHistory.slice(-10).map((entry, index) => (
            <div key={index} className="text-xs">{entry}</div>
          ))}
        </div>
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
                setSelectedCard(null);
              }}
              className="w-full mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* UNO! Popup */}
      <UnoPopup show={showUnoPopup} onClose={() => setShowUnoPopup(false)} playerName={unoPlayer || ""} />

      {/* Back Button */}
      <div className="flex justify-center">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all hover-scale"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
}

export function GamesSection() {
  const [view, setView] = useState<"menu" | "game">("menu");
  const [gameMode, setGameMode] = useState<"ai" | "multiplayer">("ai");

  if (view === "game") {
    return <LiveUnoGame onBack={() => setView("menu")} gameMode={gameMode} />;
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

      {/* Game Mode Selection */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Choose Game Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setGameMode("ai");
              setView("game");
            }}
            className="p-6 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-2xl text-black font-semibold hover:scale-105 transition-all hover-lift"
          >
            <div className="text-4xl mb-2">🐕</div>
            <h4 className="text-lg font-bold mb-2">Play vs Kandi AI</h4>
            <p className="text-sm opacity-80">Challenge our intelligent AI companion to a game of UNO!</p>
          </button>
          
          <button
            onClick={() => {
              setGameMode("multiplayer");
              setView("game");
            }}
            className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white font-semibold hover:scale-105 transition-all hover-lift"
          >
            <div className="text-4xl mb-2">👥</div>
            <h4 className="text-lg font-bold mb-2">Multiplayer</h4>
            <p className="text-sm opacity-80">Play with friends and family in a fun multiplayer session</p>
          </button>
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

      {/* Game Features */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Game Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white/80">
          <div className="text-center">
            <div className="text-3xl mb-2">🎴</div>
            <h4 className="font-semibold text-white">Real Cards</h4>
            <p className="text-sm">Beautiful card graphics</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🐕</div>
            <h4 className="font-semibold text-white">Kandi AI</h4>
            <p className="text-sm">Smart AI opponent</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h4 className="font-semibold text-white">UNO! Effects</h4>
            <p className="text-sm">Confetti & animations</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-semibold text-white">Instant Play</h4>
            <p className="text-sm">No loading required</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamesSection;

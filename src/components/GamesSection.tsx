import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function GamesSection() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [localUnoGame, setLocalUnoGame] = useState({
    playerCards: [] as string[],
    currentCard: "Red 5",
    gameStarted: false,
  });
  const [quizState, setQuizState] = useState({
    currentQuestion: 0,
    score: 0,
    gameStarted: false,
    answered: false,
  });

  const submitScore = useMutation(api.games.submitScore);
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);
  const unoGame = useQuery(api.games.getUnoGameForUser);
  const joinUnoQueue = useMutation(api.games.joinUnoQueue);
  const leaveUnoQueue = useMutation(api.games.leaveUnoQueue);
  const matchPlayersToGame = useMutation(api.games.matchPlayersToGame);
  const playUnoCardMutation = useMutation(api.games.playUnoCard);
  const unoLobbies = useQuery(api.unoLobbies.listUnoLobbies) || [];
  const createUnoLobby = useMutation(api.unoLobbies.createUnoLobby);
  const joinUnoLobby = useMutation(api.unoLobbies.joinUnoLobby);
  const leaveUnoLobby = useMutation(api.unoLobbies.leaveUnoLobby);
  const startUnoLobbyGame = useMutation(api.unoLobbies.startUnoLobbyGame);
  const [selectedLobby, setSelectedLobby] = useState<string | null>(null);
  const [myLobby, setMyLobby] = useState<any>(null);

  // Helper: Find the lobby the user is in
  useEffect(() => {
    if (!userProfile) return;
    const lobby = unoLobbies.find(l => l.playerIds.includes(userProfile.userId));
    setMyLobby(lobby || null);
  }, [unoLobbies, userProfile]);

  const inGame = !!unoGame;

  const handleJoinQueue = async () => {
    await joinUnoQueue();
    toast.success("Joined UNO queue! Waiting for other players...");
  };
  const handleLeaveQueue = async () => {
    await leaveUnoQueue();
    toast("Left UNO queue.");
  };
  const handleStartMatch = async () => {
    await matchPlayersToGame({ minPlayers: 2, maxPlayers: 4 });
  };

  const culturalQuestions = [
    {
      question: "Which festival is known as the 'Festival of Colors'?",
      options: ["Diwali", "Holi", "Eid", "Christmas"],
      correct: 1,
      category: "Hindu Traditions"
    },
    {
      question: "What is the traditional Japanese art of paper folding called?",
      options: ["Ikebana", "Origami", "Calligraphy", "Bonsai"],
      correct: 1,
      category: "Japanese Culture"
    },
    {
      question: "Which country is famous for the tango dance?",
      options: ["Spain", "Brazil", "Argentina", "Mexico"],
      correct: 2,
      category: "Dance & Music"
    },
    {
      question: "What is the traditional Scottish garment worn by men?",
      options: ["Kilt", "Toga", "Kimono", "Sari"],
      correct: 0,
      category: "Traditional Clothing"
    },
    {
      question: "Which spice is known as 'red gold'?",
      options: ["Paprika", "Saffron", "Turmeric", "Cinnamon"],
      correct: 1,
      category: "Culinary Culture"
    }
  ];

  const startUnoGame = () => {
    const cards = ["Red 1", "Red 2", "Blue 3", "Yellow 4", "Green 5", "Red Skip", "Blue Draw 2"];
    setLocalUnoGame({
      playerCards: cards.slice(0, 7),
      currentCard: "Red 5",
      gameStarted: true,
    });
    setActiveGame("uno");
  };

  const playUnoCard = (card: string) => {
    const newCards = localUnoGame.playerCards.filter(c => c !== card);
    setLocalUnoGame(prev => ({
      ...prev,
      playerCards: newCards,
      currentCard: card,
    }));

    if (newCards.length === 0) {
      toast.success("UNO! You won! 🎉");
      submitScore({ gameType: "uno", score: 100 });
      setActiveGame(null);
    }
  };

  const startQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      score: 0,
      gameStarted: true,
      answered: false,
    });
    setActiveGame("quiz");
  };

  const answerQuestion = (answerIndex: number) => {
    if (quizState.answered) return;

    const isCorrect = answerIndex === culturalQuestions[quizState.currentQuestion].correct;
    const newScore = isCorrect ? quizState.score + 20 : quizState.score;

    setQuizState(prev => ({ ...prev, score: newScore, answered: true }));

    if (isCorrect) {
      toast.success("Correct! +20 points 🎉");
    } else {
      toast.error("Incorrect! Try the next one 💪");
    }

    setTimeout(() => {
      if (quizState.currentQuestion < culturalQuestions.length - 1) {
        setQuizState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
          answered: false,
        }));
      } else {
        toast.success(`Quiz complete! Final score: ${newScore} points`);
        submitScore({ gameType: "quiz", score: newScore });
        setActiveGame(null);
      }
    }, 1500);
  };

  function MultiplayerUnoGame({ unoGame, userProfile }: { unoGame: any, userProfile: any }) {
    if (!unoGame || !userProfile) return null;
    const state = JSON.parse(unoGame.state);
    const playerIndex = unoGame.playerIds.findIndex((id: string) => id === userProfile.userId);
    const isMyTurn = unoGame.currentTurn === playerIndex;
    const myHand = state.playerHands[playerIndex] || [];
    const otherPlayers = unoGame.playerIds.map((id: string, idx: number) => ({
      id,
      cardCount: state.playerHands[idx]?.length || 0,
      isCurrent: unoGame.currentTurn === idx,
      isMe: idx === playerIndex,
    }));
    const winnerIdx = unoGame.winnerId ? unoGame.playerIds.findIndex((id: string) => id === unoGame.winnerId) : null;

    const handlePlayCard = async (card: string) => {
      await playUnoCardMutation({ card });
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">🎮 Multiplayer UNO</h2>
          {winnerIdx !== null && (
            <span className="text-green-400 font-bold">Winner: Player {winnerIdx + 1}</span>
          )}
        </div>
        <div className="flex space-x-4 mb-4">
          {otherPlayers.map((p, idx) => (
            <div key={p.id} className={`flex flex-col items-center ${p.isMe ? 'font-bold text-orange-400' : 'text-white/70'}`}> 
              <span>Player {idx + 1}{p.isMe ? ' (You)' : ''}</span>
              <span>{p.cardCount} cards</span>
              {p.isCurrent && <span className="text-green-400">⬅️ Turn</span>}
            </div>
          ))}
        </div>
        <div className="text-center mb-6">
          <div className="w-24 h-36 bg-gradient-to-br from-red-500 to-red-700 rounded-lg mx-auto flex items-center justify-center border-4 border-white/20">
            <span className="text-white font-bold text-lg">{state.currentCard || '...'}</span>
          </div>
          <p className="text-white/70 mt-2">Current Card</p>
        </div>
        <div>
          <h3 className="text-white/80 font-medium mb-2">Your Hand</h3>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {myHand.map((card: string, idx: number) => (
              <button
                key={idx}
                onClick={() => isMyTurn && handlePlayCard(card)}
                disabled={!isMyTurn}
                className={`w-full h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center border-2 border-white/20 transition-all text-white font-semibold text-sm ${isMyTurn ? 'hover:border-white/50' : 'opacity-50 cursor-not-allowed'}`}
              >
                {card}
              </button>
            ))}
          </div>
          {!isMyTurn && <p className="text-white/60 mt-4">Waiting for your turn...</p>}
        </div>
      </div>
    );
  }

  if (activeGame === "uno") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-0">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">🎮 Cultural UNO</h2>
            <button
              onClick={() => setActiveGame(null)}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Back to Games
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-24 h-36 bg-gradient-to-br from-red-500 to-red-700 rounded-lg mx-auto flex items-center justify-center border-4 border-white/20">
              <span className="text-white font-bold text-lg">{unoGame.currentCard}</span>
            </div>
            <p className="text-white/70 mt-2">Current Card</p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {unoGame.playerCards.map((card, index) => (
              <button
                key={index}
                onClick={() => playUnoCard(card)}
                className="w-full h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center border-2 border-white/20 hover:border-white/50 transition-all text-white font-semibold text-sm"
              >
                {card}
              </button>
            ))}
          </div>

          <p className="text-center text-white/70 mt-4">
            Cards remaining: {unoGame.playerCards.length}
          </p>
        </div>
      </div>
    );
  }

  if (activeGame === "quiz") {
    const currentQ = culturalQuestions[quizState.currentQuestion];
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-0">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">🧠 Cultural Quiz</h2>
            <button
              onClick={() => setActiveGame(null)}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Back to Games
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/70">Question {quizState.currentQuestion + 1} of {culturalQuestions.length}</span>
              <span className="text-white font-bold">Score: {quizState.score}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${((quizState.currentQuestion + 1) / culturalQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <span className="text-orange-400 text-sm font-medium">{currentQ.category}</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-6">{currentQ.question}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => answerQuestion(index)}
                  disabled={quizState.answered}
                  className={`p-4 rounded-lg text-left transition-all ${
                    quizState.answered
                      ? index === currentQ.correct
                        ? 'bg-green-500/20 border-green-400 text-green-200'
                        : 'bg-white/10 text-white/50'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">🎮 Cultural Games & Challenges</h1>
        <p className="text-white/70">Test your cultural knowledge and have fun!</p>
      </div>

      {/* Games Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* UNO Game Section (Lobby-based) */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🎴</span>
            </div>
            <h3 className="text-xl font-bold text-white">Cultural UNO</h3>
            <p className="text-white/70">Play UNO with a cultural twist! Join or create a lobby to play with others.</p>
            {!userProfile ? (
              <p className="text-white/60">Sign in to play UNO with others!</p>
            ) : myLobby ? (
              <div>
                <h4 className="text-white font-semibold mb-2">Lobby: {myLobby._id}</h4>
                <p className="text-white/70 mb-2">Players: {myLobby.playerIds.length}</p>
                <div className="flex gap-2 mb-2">
                  {myLobby.playerIds.map((id: string, idx: number) => (
                    <span key={id} className="px-2 py-1 bg-white/20 rounded text-white text-xs">Player {idx + 1}{id === myLobby.creatorId ? ' (Host)' : ''}</span>
                  ))}
                </div>
                {myLobby.status === "open" && myLobby.creatorId === userProfile.userId && myLobby.playerIds.length >= 2 && (
                  <button onClick={async () => { await startUnoLobbyGame({ lobbyId: myLobby._id }); }} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all">Start Game</button>
                )}
                <button onClick={async () => { await leaveUnoLobby({ lobbyId: myLobby._id }); }} className="ml-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all">Leave Lobby</button>
                {myLobby.status === "started" && (
                  <MultiplayerUnoGame unoGame={unoGame} userProfile={userProfile} />
                )}
              </div>
            ) : (
              <div>
                <button onClick={async () => { await createUnoLobby(); }} className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all mb-4">Create Lobby</button>
                <h4 className="text-white font-semibold mb-2">Open Lobbies</h4>
                {unoLobbies.length === 0 && <p className="text-white/60">No open lobbies. Create one above!</p>}
                <ul className="space-y-2">
                  {unoLobbies.map(lobby => (
                    <li key={lobby._id} className="flex items-center justify-between bg-white/10 rounded p-2">
                      <span className="text-white">Lobby {lobby._id} ({lobby.playerIds.length} players)</span>
                      <button onClick={async () => { await joinUnoLobby({ lobbyId: lobby._id }); }} className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600">Join</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Game */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-xl font-bold text-white">Cultural Quiz</h3>
            <p className="text-white/70">Test your knowledge about world cultures, traditions, and customs. Earn points for correct answers!</p>
            <button
              onClick={startQuiz}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">🌟 Daily Challenges</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/30">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🎯</span>
              <h3 className="font-semibold text-white mb-2">Daily Quiz</h3>
              <p className="text-white/70 text-sm mb-3">Complete today's cultural quiz</p>
              <div className="text-yellow-400 font-bold">+50 XP</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-400/30">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🎴</span>
              <h3 className="font-semibold text-white mb-2">UNO Master</h3>
              <p className="text-white/70 text-sm mb-3">Win 3 UNO games today</p>
              <div className="text-blue-400 font-bold">+100 XP</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl p-4 border border-green-400/30">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🌍</span>
              <h3 className="font-semibold text-white mb-2">Culture Explorer</h3>
              <p className="text-white/70 text-sm mb-3">Learn about 5 new cultures</p>
              <div className="text-green-400 font-bold">+75 XP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

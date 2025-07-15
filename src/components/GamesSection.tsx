import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function GamesSection() {
  const [activeTab, setActiveTab] = useState<"trivia" | "history" | "leaderboard">("trivia");
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [newGameData, setNewGameData] = useState({
    title: "",
    category: "cultural",
    timeLimit: 30,
    questions: [
      { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
    ]
  });

  const triviaGames = useQuery(api.games.getTriviaGames);
  const activeSessions = useQuery(api.games.getActiveTriviaSessions, { isPublic: true });
  const userHistory = useQuery(api.games.getUserTriviaHistory);
  const leaderboard = useQuery(api.games.getTriviaLeaderboard, { limit: 10 });

  const createTriviaGame = useMutation(api.games.createTriviaGame);
  const createTriviaSession = useMutation(api.games.createTriviaSession);
  const joinTriviaSession = useMutation(api.games.joinTriviaSession);
  const startTriviaSession = useMutation(api.games.startTriviaSession);
  const submitTriviaAnswer = useMutation(api.games.submitTriviaAnswer);

  const handleCreateGame = async () => {
    try {
      await createTriviaGame(newGameData);
      toast.success("Trivia game created successfully!");
      setShowCreateGame(false);
      setNewGameData({
        title: "",
        category: "cultural",
        timeLimit: 30,
        questions: [
          { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
        ]
      });
    } catch (error) {
      toast.error("Failed to create trivia game");
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      await joinTriviaSession({ sessionId: sessionId as any });
      toast.success("Joined trivia session!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join session");
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await startTriviaSession({ sessionId: sessionId as any });
      toast.success("Trivia session started!");
    } catch (error: any) {
      toast.error(error.message || "Failed to start session");
    }
  };

  const handleCreateSession = async (gameId: string) => {
    try {
      await createTriviaSession({ gameId: gameId as any, maxPlayers: 4, isPublic: true });
      toast.success("Trivia session created!");
    } catch (error: any) {
      toast.error("Failed to create session");
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !selectedGame) return;

    try {
      await submitTriviaAnswer({
        sessionId: selectedGame._id,
        questionIndex: currentQuestion,
        selectedAnswer,
        timeSpent: 30 - timeLeft,
      });

      if (currentQuestion < selectedGame.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(30);
      } else {
        setGameStarted(false);
        setSelectedGame(null);
        toast.success("Game completed!");
      }
    } catch (error) {
      toast.error("Failed to submit answer");
    }
  };

  const addQuestion = () => {
    setNewGameData(prev => ({
      ...prev,
      questions: [...prev.questions, { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }]
    }));
  };

  const removeQuestion = (index: number) => {
    if (newGameData.questions.length > 1) {
      setNewGameData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setNewGameData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("trivia")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === "trivia"
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🎮 Trivia Games
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === "history"
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              📊 History
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === "leaderboard"
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Trivia Games Tab */}
      {activeTab === "trivia" && (
        <div className="space-y-6">
          {/* Create Game Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowCreateGame(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              🎯 Create New Trivia Game
            </button>
          </div>

          {/* Active Sessions */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">🎪 Active Sessions</h3>
            {!activeSessions ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
              </div>
            ) : activeSessions.length === 0 ? (
              <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="text-4xl mb-4">🎪</div>
                <h4 className="text-lg font-semibold text-white mb-2">No active sessions</h4>
                <p className="text-white/70">Create a new trivia game to get started!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeSessions.map((session) => (
                  <div key={session._id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">Session #{session._id.slice(-6)}</h4>
                        <p className="text-white/70 text-sm">{session.players.length}/{session.maxPlayers} players</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === "waiting" ? "bg-yellow-500/20 text-yellow-200" :
                        session.status === "active" ? "bg-green-500/20 text-green-200" :
                        "bg-gray-500/20 text-gray-200"
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {session.status === "waiting" && (
                        <button
                          onClick={() => handleJoinSession(session._id)}
                          className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:from-blue-600 hover:to-cyan-600 transition-all"
                        >
                          Join Session
                        </button>
                      )}
                      {session.status === "waiting" && session.players.length >= 2 && (
                        <button
                          onClick={() => handleStartSession(session._id)}
                          className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
                        >
                          Start Game
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Games */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">🎯 Available Games</h3>
            {!triviaGames ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
              </div>
            ) : triviaGames.length === 0 ? (
              <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="text-lg font-semibold text-white mb-2">No games available</h4>
                <p className="text-white/70">Create the first trivia game!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {triviaGames.map((game) => (
                  <div key={game._id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h4 className="text-lg font-semibold text-white mb-2">{game.title}</h4>
                    <p className="text-white/70 text-sm mb-4">{game.category} • {game.timeLimit}s per question</p>
                    
                    <button
                      onClick={() => handleCreateSession(game._id)}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:from-orange-600 hover:to-pink-600 transition-all"
                    >
                      Create Session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">📊 Your Game History</h3>
          {!userHistory ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
            </div>
          ) : userHistory.length === 0 ? (
            <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-lg font-semibold text-white mb-2">No games played yet</h4>
              <p className="text-white/70">Start playing trivia games to see your history!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userHistory.map((game) => (
                <div key={game._id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{game.gameTitle}</h4>
                      <p className="text-white/70 text-sm">
                        {game.correctAnswers}/{game.totalQuestions} correct • Score: {game.score}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{game.score}</div>
                      <div className="text-white/60 text-sm">points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">🏆 Top Players</h3>
          {!leaderboard ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-4xl mb-4">🏆</div>
              <h4 className="text-lg font-semibold text-white mb-2">No players yet</h4>
              <p className="text-white/70">Be the first to play and top the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((player, index) => (
                <div key={player.userId} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-purple-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{player.displayName}</h4>
                        <p className="text-white/70 text-sm">{player.gamesPlayed} games • Avg: {player.averageScore}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{player.totalScore}</div>
                      <div className="text-white/60 text-sm">total points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Game Modal */}
      {showCreateGame && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full border border-white/20 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Create New Trivia Game</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Game Title</label>
                <input
                  type="text"
                  value={newGameData.title}
                  onChange={(e) => setNewGameData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Enter game title"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Category</label>
                <select
                  value={newGameData.category}
                  onChange={(e) => setNewGameData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="cultural">Cultural</option>
                  <option value="general">General</option>
                  <option value="history">History</option>
                  <option value="geography">Geography</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Time Limit (seconds)</label>
                <input
                  type="number"
                  value={newGameData.timeLimit}
                  onChange={(e) => setNewGameData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  min="10"
                  max="120"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-white/80">Questions</label>
                  <button
                    onClick={addQuestion}
                    className="px-3 py-1 rounded-lg bg-green-500/20 text-green-200 text-sm hover:bg-green-500/30"
                  >
                    + Add Question
                  </button>
                </div>
                
                <div className="space-y-4">
                  {newGameData.questions.map((question, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-white font-medium">Question {index + 1}</h4>
                        {newGameData.questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                          placeholder="Enter question"
                        />
                        
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`correct-${index}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() => updateQuestion(index, 'correctAnswer', optionIndex)}
                              className="text-orange-500 focus:ring-orange-400"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateQuestion(index, 'options', question.options.map((o, i) => i === optionIndex ? e.target.value : o))}
                              className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                          </div>
                        ))}
                        
                        <input
                          type="text"
                          value={question.explanation}
                          onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                          placeholder="Explanation (optional)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateGame(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGame}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold"
              >
                Create Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

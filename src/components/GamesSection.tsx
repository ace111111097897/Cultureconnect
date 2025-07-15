import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function GamesSection() {
  const [activeTab, setActiveTab] = useState<"lobbies" | "history">("lobbies");
  const [showCreateLobby, setShowCreateLobby] = useState(false);
  const [newLobbyData, setNewLobbyData] = useState({
    name: "",
    maxPlayers: 4,
  });

  const unoLobbies = useQuery(api.games.getUnoLobbies);
  const userHistory = useQuery(api.games.getUserGameHistory);

  const createUnoLobby = useMutation(api.games.createUnoLobby);
  const joinUnoLobby = useMutation(api.games.joinUnoLobby);
  const leaveUnoLobby = useMutation(api.games.leaveUnoLobby);
  const startUnoGame = useMutation(api.games.startUnoGame);

  const handleCreateLobby = async () => {
    try {
      await createUnoLobby(newLobbyData);
      toast.success("UNO lobby created successfully!");
      setShowCreateLobby(false);
      setNewLobbyData({
        name: "",
        maxPlayers: 4,
      });
    } catch (error) {
      toast.error("Failed to create UNO lobby");
    }
  };

  const handleJoinLobby = async (lobbyId: string) => {
    try {
      await joinUnoLobby({ lobbyId: lobbyId as any });
      toast.success("Joined UNO lobby!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join lobby");
    }
  };

  const handleLeaveLobby = async (lobbyId: string) => {
    try {
      await leaveUnoLobby({ lobbyId: lobbyId as any });
      toast.success("Left UNO lobby");
    } catch (error: any) {
      toast.error("Failed to leave lobby");
    }
  };

  const handleStartGame = async (lobbyId: string) => {
    try {
      await startUnoGame({ lobbyId: lobbyId as any });
      toast.success("UNO game started!");
    } catch (error: any) {
      toast.error("Failed to start game");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("lobbies")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === "lobbies"
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🎮 UNO Lobbies
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
          </div>
        </div>
      </div>

      {/* UNO Lobbies Tab */}
      {activeTab === "lobbies" && (
        <div className="space-y-6">
          {/* Create Lobby Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowCreateLobby(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              🎯 Create UNO Lobby
            </button>
          </div>

          {/* Create Lobby Modal */}
          {showCreateLobby && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-white mb-4">Create UNO Lobby</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2">Lobby Name</label>
                    <input
                      type="text"
                      value={newLobbyData.name}
                      onChange={(e) => setNewLobbyData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                      placeholder="Enter lobby name"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Max Players</label>
                    <select
                      value={newLobbyData.maxPlayers}
                      onChange={(e) => setNewLobbyData(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value={2}>2 Players</option>
                      <option value={3}>3 Players</option>
                      <option value={4}>4 Players</option>
                      <option value={6}>6 Players</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCreateLobby}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowCreateLobby(false)}
                      className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Lobbies */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">🎪 Active Lobbies</h3>
            {!unoLobbies ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
              </div>
            ) : unoLobbies.length === 0 ? (
              <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="text-4xl mb-4">🎪</div>
                <h4 className="text-lg font-semibold text-white mb-2">No active lobbies</h4>
                <p className="text-white/70">Create a new UNO lobby to get started!</p>
              </div>
            ) :
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unoLobbies.map((lobby) => (
                  <div key={lobby._id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{lobby.name}</h4>
                        <p className="text-white/70 text-sm">
                          {lobby.players.length}/{lobby.maxPlayers} players
                        </p>
                        <p className="text-white/60 text-xs capitalize">{lobby.status}</p>
                      </div>
                      <div className="text-2xl">🎴</div>
                    </div>
                    
                    <div className="space-y-2">
                      {lobby.status === "waiting" && (
                        <>
                          <button
                            onClick={() => handleJoinLobby(lobby._id)}
                            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                          >
                            Join Lobby
                          </button>
                          {lobby.hostId === "current-user-id" && (
                            <button
                              onClick={() => handleStartGame(lobby._id)}
                              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
                            >
                              Start Game
                            </button>
                          )}
                        </>
                      )}
                      {lobby.status === "playing" && (
                        <div className="text-center">
                          <p className="text-green-400 font-medium">Game in Progress</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white mb-4">📊 Game History</h3>
          {!userHistory ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
            </div>
          ) : userHistory.length === 0 ? (
            <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-lg font-semibold text-white mb-2">No game history</h4>
              <p className="text-white/70">Play some UNO games to see your history here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userHistory.map((game) => (
                <div key={game._id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{game.name}</h4>
                      <p className="text-white/70 text-sm">
                        {game.playerCount} players • {game.status}
                      </p>
                    </div>
                    <div className="text-2xl">🎴</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GamesSection;

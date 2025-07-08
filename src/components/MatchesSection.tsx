import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function MatchesSection() {
  const matches = useQuery(api.matches.getUserMatches);

  if (!matches) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
          <div className="text-6xl mb-4">💫</div>
          <h2 className="text-2xl font-bold text-white mb-4">No matches yet</h2>
          <p className="text-white/70">
            Keep exploring profiles to find your cultural connections!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">Your Cultural Matches</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.filter(Boolean).map((match) => (
          <div
            key={match!._id}
            className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
          >
            {/* Profile Image */}
            <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 relative">
              {match!.otherProfile.profileImageUrl ? (
                <img
                  src={match!.otherProfile.profileImageUrl}
                  alt={match!.otherProfile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-4xl text-white/50">👤</div>
                </div>
              )}
              
              {/* Compatibility Score */}
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-sm font-semibold">
                  {match!.compatibilityScore}%
                </span>
              </div>
            </div>

            {/* Match Info */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {match!.otherProfile.displayName}, {match!.otherProfile.age}
                </h3>
                <p className="text-white/70 text-sm">{match!.otherProfile.location}</p>
              </div>

              {/* Shared Interests */}
              <div>
                <p className="text-white/80 text-sm mb-2">Shared interests:</p>
                <div className="flex flex-wrap gap-1">
                  {match!.sharedInterests.slice(0, 3).map((interest, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-orange-500/20 text-orange-200 rounded text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                  {match!.sharedInterests.length > 3 && (
                    <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs">
                      +{match!.sharedInterests.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Match Date */}
              <p className="text-white/50 text-xs">
                Matched {new Date(match!.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

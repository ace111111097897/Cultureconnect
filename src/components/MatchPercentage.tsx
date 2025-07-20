import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface MatchPercentageProps {
  targetUserId: Id<"users">;
  showDetails?: boolean;
}

const MatchPercentage: React.FC<MatchPercentageProps> = ({ targetUserId, showDetails = false }) => {
  const matchData = useQuery(api.profiles.calculateMatchPercentage, { targetUserId });

  if (!matchData) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <span className="text-gray-500 text-sm">Calculating...</span>
      </div>
    );
  }

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMatchEmoji = (percentage: number) => {
    if (percentage >= 80) return '🔥';
    if (percentage >= 60) return '💫';
    if (percentage >= 40) return '✨';
    return '🌟';
  };

  return (
    <div className="space-y-3">
      {/* Main Match Percentage */}
      <div className="flex items-center space-x-3">
        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${getMatchColor(matchData.matchPercentage)}`}>
          <div className="absolute inset-0 rounded-full border-4 border-current opacity-20"></div>
          <div className="text-center">
            <div className="text-lg font-bold">{matchData.matchPercentage}%</div>
            <div className="text-xs">Match</div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getMatchEmoji(matchData.matchPercentage)}</span>
            <div>
              <div className="font-semibold text-gray-800">
                {matchData.matchPercentage >= 80 ? 'Excellent Match!' :
                 matchData.matchPercentage >= 60 ? 'Great Match!' :
                 matchData.matchPercentage >= 40 ? 'Good Match!' : 'Potential Match!'}
              </div>
              <div className="text-sm text-gray-600">
                {matchData.sharedInterests.length} shared interests
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Interests */}
      {matchData.sharedInterests.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-semibold text-gray-700 mb-2">Shared Interests:</div>
          <div className="flex flex-wrap gap-2">
            {matchData.sharedInterests.map((interest: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700">Compatibility Breakdown:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(matchData.detailedBreakdown).map(([category, score]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${(score as number) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-700 font-medium w-8 text-right">
                    {Math.round((score as number) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchPercentage; 
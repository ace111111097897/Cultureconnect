import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export function NewsSection() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const getAiNews = useAction(api.news.getAiNews);
  const [news, setNews] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const aiNews = await getAiNews({});
      setNews(aiNews);
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e.message || "Failed to fetch news");
      setNews(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNews();
    // eslint-disable-next-line
  }, []);

  const handleRefresh = () => {
    fetchNews();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffInHours < 1) {
        return "Just now";
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">Live AI News</h2>
          <div className="flex items-center space-x-4 text-white/70">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              AI Powered
            </span>
            <span>Last updated: {formatDate(lastRefresh.toISOString())}</span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">Unable to load news</h3>
          <p className="text-white/70 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* News Grid */}
      {!loading && !error && news && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article, index) => (
            <div key={index} className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-lg flex flex-col hover:bg-white/15 transition-all">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                {article.title}
              </h3>
              <div className="flex items-center text-white/60 text-sm mb-3">
                <span>{article.source}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(article.published)}</span>
              </div>
              <p className="text-white/70 mb-4 line-clamp-3">
                {article.description}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all text-center"
              >
                Read More
              </a>
            </div>
          ))}
        </div>
      )}

      {/* No News State */}
      {!loading && !error && (!news || news.length === 0) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-semibold text-white mb-2">No news available</h3>
          <p className="text-white/70">Check back later.</p>
        </div>
      )}
    </div>
  );
} 
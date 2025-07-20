import React, { useState, useEffect } from "react";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: { name: string };
}

export function NewsSection() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://newsapi.org/v2/top-headlines?country=us&pageSize=10&apiKey=bf9f8040204d430a9842c126924175ef`
        );
        const data = await res.json();
        if (data.status !== "ok") throw new Error(data.message || "Failed to fetch news");
        setNews(data.articles);
      } catch (e: any) {
        setError(e.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-2 text-white">Live News</h2>
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
        </div>
      )}
      {error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">Unable to load news</h3>
          <p className="text-white/70 mb-4">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article, index) => (
            <div key={index} className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-lg flex flex-col hover:bg-white/15 transition-all">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                {article.title}
              </h3>
              <div className="flex items-center text-white/60 text-sm mb-3">
                <span>{article.source?.name}</span>
                <span className="mx-2">•</span>
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
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
    </div>
  );
} 
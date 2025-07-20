import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function NewsSection() {
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch news with error handling
  const newsData = useQuery(api.news.getNews, {
    category: selectedCategory,
    country: selectedCountry,
  });

  const categories = [
    { id: "general", name: "General", icon: "📰" },
    { id: "technology", name: "Technology", icon: "💻" },
    { id: "business", name: "Business", icon: "💼" },
    { id: "entertainment", name: "Entertainment", icon: "🎬" },
    { id: "health", name: "Health", icon: "🏥" },
    { id: "science", name: "Science", icon: "🔬" },
    { id: "sports", name: "Sports", icon: "⚽" },
  ];

  const countries = [
    { id: "us", name: "United States", flag: "🇺🇸" },
    { id: "gb", name: "United Kingdom", flag: "🇬🇧" },
    { id: "ca", name: "Canada", flag: "🇨🇦" },
    { id: "au", name: "Australia", flag: "🇦🇺" },
    { id: "in", name: "India", flag: "🇮🇳" },
    { id: "jp", name: "Japan", flag: "🇯🇵" },
    { id: "de", name: "Germany", flag: "🇩🇪" },
    { id: "fr", name: "France", flag: "🇫🇷" },
  ];

  const handleRefresh = () => {
    setLastRefresh(new Date());
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

  if (!newsData) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">Live News</h2>
          <div className="flex items-center space-x-4 text-white/70">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              {newsData.source === "live" ? "Live" : "Cached"}
            </span>
            <span>Last updated: {formatDate(lastRefresh.toISOString())}</span>
            {newsData.source === "fallback" && (
              <span className="text-orange-400">⚠️ Using fallback news</span>
            )}
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Country</h3>
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCountry === country.id
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="mr-2">{country.flag}</span>
                {country.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsData.news?.map((article, index) => (
          <div key={index} className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-lg flex flex-col hover:bg-white/15 transition-all">
            {/* Article Image */}
            {article.image && (
              <div className="mb-4 h-48 rounded-lg overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Article Content */}
            <div className="flex-1">
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
            </div>

            {/* Read More Button */}
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

      {/* No News State */}
      {(!newsData.news || newsData.news.length === 0) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-semibold text-white mb-2">No news available</h3>
          <p className="text-white/70">Try changing the category or country, or check back later.</p>
        </div>
      )}

      {/* Error State */}
      {newsData.error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">Unable to load news</h3>
          <p className="text-white/70 mb-4">{newsData.error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
} 
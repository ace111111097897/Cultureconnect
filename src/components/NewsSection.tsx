import React, { useState } from "react";

export function NewsSection() {
  // Hardcoded news data
  const [news] = useState([
    {
      title: "AI Revolutionizes News Delivery",
      description: "AI-powered platforms are changing how news is curated and delivered worldwide.",
      url: "https://example.com/ai-news",
      published: new Date().toISOString(),
      source: "AI News Network",
    },
    {
      title: "Cultural Festivals Go Virtual",
      description: "Global festivals are now accessible online, connecting people across continents.",
      url: "https://example.com/virtual-festivals",
      published: new Date().toISOString(),
      source: "Culture Today",
    },
    {
      title: "Language Learning Apps See Surge in Popularity",
      description: "Digital platforms are making it easier than ever to learn new languages and connect with people globally.",
      url: "https://example.com/language-apps",
      published: new Date().toISOString(),
      source: "EdTech News",
    },
  ]);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-2 text-white">Live News</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article, index) => (
          <div key={index} className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-lg flex flex-col hover:bg-white/15 transition-all">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
              {article.title}
            </h3>
            <div className="flex items-center text-white/60 text-sm mb-3">
              <span>{article.source}</span>
              <span className="mx-2">•</span>
              <span>{new Date(article.published).toLocaleDateString()}</span>
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
    </div>
  );
} 
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function CultureFeed() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showKabukiModal, setShowKabukiModal] = useState(false);
  const [showRecipesModal, setShowRecipesModal] = useState(false);
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);
  
  // Example cultural news data - in a real app, this would come from an API
  const culturalNews = [
    {
      id: 1,
      title: "Diwali Celebrations Light Up Cities Worldwide",
      summary: "The Festival of Lights brings communities together across the globe with spectacular displays and traditional ceremonies.",
      category: "festivals",
      country: "India",
      image: "🪔",
      timeAgo: "2 hours ago",
      likes: 234,
      comments: 45
    },
    {
      id: 2,
      title: "UNESCO Recognizes New Intangible Cultural Heritage",
      summary: "Traditional weaving techniques from Peru and folk music from Ireland added to the prestigious list.",
      category: "heritage",
      country: "Global",
      image: "🏛️",
      timeAgo: "5 hours ago",
      likes: 189,
      comments: 32
    },
    {
      id: 3,
      title: "Cherry Blossom Season Begins in Japan",
      summary: "Sakura blooms mark the start of hanami season, bringing people together for traditional flower viewing.",
      category: "nature",
      country: "Japan",
      image: "🌸",
      timeAgo: "8 hours ago",
      likes: 456,
      comments: 78
    },
    {
      id: 4,
      title: "African Fashion Week Showcases Traditional Designs",
      summary: "Designers blend ancestral techniques with modern aesthetics in stunning runway presentations.",
      category: "fashion",
      country: "Nigeria",
      image: "👗",
      timeAgo: "12 hours ago",
      likes: 312,
      comments: 56
    },
    {
      id: 5,
      title: "Ancient Mayan Ruins Reveal New Archaeological Discoveries",
      summary: "Recent excavations uncover artifacts that shed light on pre-Columbian trade networks.",
      category: "archaeology",
      country: "Mexico",
      image: "🏺",
      timeAgo: "1 day ago",
      likes: 567,
      comments: 89
    }
  ];

  const categories = [
    { id: "all", label: "All", icon: "🌍" },
    { id: "festivals", label: "Festivals", icon: "🎉" },
    { id: "heritage", label: "Heritage", icon: "🏛️" },
    { id: "nature", label: "Nature", icon: "🌸" },
    { id: "fashion", label: "Fashion", icon: "👗" },
    { id: "archaeology", label: "History", icon: "🏺" },
  ];

  const filteredNews = selectedCategory === "all" 
    ? culturalNews 
    : culturalNews.filter(item => item.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">🌍 Culture Feed</h1>
        <p className="text-white/70">Stay updated with cultural events and news from around the world</p>
      </div>

      {/* Category Filter */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* News Feed */}
      <div className="space-y-4">
        {filteredNews.map(item => (
          <div key={item.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-xl flex items-center justify-center text-2xl border border-orange-400/30">
                {item.image}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-200 rounded-full text-xs font-medium">
                    {item.country}
                  </span>
                  <span className="text-white/50 text-sm">{item.timeAgo}</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/70 mb-4">{item.summary}</p>
                
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-white/60 hover:text-white transition-all">
                    <span>❤️</span>
                    <span className="text-sm">{item.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-white/60 hover:text-white transition-all">
                    <span>💬</span>
                    <span className="text-sm">{item.comments}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-white/60 hover:text-white transition-all">
                    <span>📤</span>
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cultural Spotlight */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">✨ Cultural Spotlight</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-400/30">
            <div className="text-center space-y-4">
              <span className="text-4xl">🎭</span>
              <h3 className="text-xl font-bold text-white">Traditional Theater</h3>
              <p className="text-white/70">Explore the rich history of Kabuki theater and its influence on modern performance art.</p>
              <button
                className="px-4 py-2 rounded-lg bg-purple-500/30 text-purple-200 hover:bg-purple-500/40 transition-all"
                onClick={() => userProfile && setShowKabukiModal(true)}
                disabled={!userProfile}
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl p-6 border border-green-400/30">
            <div className="text-center space-y-4">
              <span className="text-4xl">🍜</span>
              <h3 className="text-xl font-bold text-white">Culinary Traditions</h3>
              <p className="text-white/70">Discover the stories behind traditional recipes passed down through generations.</p>
              <button
                className="px-4 py-2 rounded-lg bg-green-500/30 text-green-200 hover:bg-green-500/40 transition-all"
                onClick={() => userProfile && setShowRecipesModal(true)}
                disabled={!userProfile}
              >
                Explore Recipes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">🔥 Trending Cultural Topics</h2>
        
        <div className="flex flex-wrap gap-2">
          {[
            "#Diwali2024", "#CherryBlossoms", "#AfricanFashion", 
            "#MayanHeritage", "#TraditionalMusic", "#CulturalExchange",
            "#FestivalSeason", "#WorldHeritage", "#CulturalDiversity"
          ].map(tag => (
            <span key={tag} className="px-3 py-1 bg-orange-500/20 text-orange-200 rounded-full text-sm hover:bg-orange-500/30 cursor-pointer transition-all">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Kabuki Modal */}
      {showKabukiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white/90 rounded-2xl p-8 max-w-lg w-full relative shadow-xl">
            <button
              className="absolute top-3 right-3 text-2xl text-gray-700 hover:text-black"
              onClick={() => setShowKabukiModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-purple-700">Kabuki Theater</h2>
            <p className="text-gray-800 mb-4">
              <strong>Kabuki</strong> is a classical Japanese dance-drama known for its stylized performance, elaborate costumes, and the use of makeup. Originating in the early 17th century, Kabuki has played a significant role in shaping Japanese culture and theater. Its influence can be seen in modern performance art, film, and fashion worldwide.
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Originated in the Edo period (1603-1868)</li>
              <li>Features all-male casts (onnagata play female roles)</li>
              <li>Known for dynamic stage effects and revolving platforms</li>
              <li>Recognized as UNESCO Intangible Cultural Heritage</li>
            </ul>
            <p className="text-gray-800">
              Today, Kabuki continues to captivate audiences with its blend of tradition and innovation, inspiring artists and performers around the globe.
            </p>
          </div>
        </div>
      )}

      {/* Recipes Modal */}
      {showRecipesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white/90 rounded-2xl p-8 max-w-lg w-full relative shadow-xl">
            <button
              className="absolute top-3 right-3 text-2xl text-gray-700 hover:text-black"
              onClick={() => setShowRecipesModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-green-700">Traditional Recipes</h2>
            <ul className="list-disc pl-6 text-gray-800 space-y-2">
              <li><strong>Okonomiyaki</strong> (Japan): Savory pancake with cabbage, pork, and special sauce.</li>
              <li><strong>Jollof Rice</strong> (West Africa): Spiced tomato rice with vegetables and meat.</li>
              <li><strong>Dolma</strong> (Middle East): Grape leaves stuffed with rice, herbs, and sometimes meat.</li>
              <li><strong>Pierogi</strong> (Poland): Dumplings filled with potato, cheese, or meat.</li>
              <li><strong>Arepas</strong> (Venezuela/Colombia): Cornmeal cakes stuffed with cheese, meats, or beans.</li>
              <li><strong>Biryani</strong> (India): Fragrant rice dish with spices, meat, and vegetables.</li>
              <li><strong>Empanadas</strong> (Latin America): Pastries filled with meat, cheese, or vegetables.</li>
              <li><strong>Tagine</strong> (Morocco): Slow-cooked stew with meat, vegetables, and spices.</li>
              <li><strong>Kimchi</strong> (Korea): Fermented vegetables, usually cabbage and radish, with chili and garlic.</li>
              <li><strong>Mole</strong> (Mexico): Rich sauce made with chiles, chocolate, and spices, served over meat.</li>
            </ul>
            <p className="text-gray-700 mt-4">Explore these recipes and discover the stories behind each dish!</p>
          </div>
        </div>
      )}
    </div>
  );
}

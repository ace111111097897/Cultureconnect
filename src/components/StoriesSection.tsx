import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const STORY_CATEGORIES = [
  { id: "tradition", label: "Traditions", icon: "🎭" },
  { id: "food", label: "Food", icon: "🍽️" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
];

const REACTION_TYPES = ["❤️", "🔥", "👏", "😍", "🌟"];

export function StoriesSection() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [newStory, setNewStory] = useState({
    title: "",
    content: "",
    category: "tradition",
    isPublic: true,
  });

  const stories = useQuery(api.stories.getCulturalStories, {
    category: selectedCategory,
    limit: 20,
  });
  
  const createStory = useMutation(api.stories.createCulturalStory);
  const likeStory = useMutation(api.stories.likeCulturalStory);
  const addReaction = useMutation(api.storyReactions.addStoryReaction);
  const removeReaction = useMutation(api.storyReactions.removeStoryReaction);

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStory.title.trim() || !newStory.content.trim()) return;

    try {
      await createStory(newStory);
      toast.success("Story shared successfully!");
      setNewStory({ title: "", content: "", category: "tradition", isPublic: true });
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Failed to share story");
      console.error(error);
    }
  };

  const handleLikeStory = async (storyId: string) => {
    try {
      await likeStory({ storyId: storyId as any });
    } catch (error) {
      console.error("Failed to like story:", error);
    }
  };

  const handleReaction = async (storyId: string, reactionType: string) => {
    try {
      await addReaction({ storyId: storyId as any, reactionType });
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Cultural Stories</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all"
        >
          Share Your Story
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                !selectedCategory
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              All Stories
            </button>
            {STORY_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Story Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Share Your Cultural Story</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-6">
              <div>
                <label className="block text-white/80 mb-2">Story Title</label>
                <input
                  type="text"
                  value={newStory.title}
                  onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Give your story a meaningful title..."
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Category</label>
                <select
                  value={newStory.category}
                  onChange={(e) => setNewStory(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {STORY_CATEGORIES.map(category => (
                    <option key={category.id} value={category.id} className="bg-gray-800">
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Your Story</label>
                <textarea
                  value={newStory.content}
                  onChange={(e) => setNewStory(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 h-40"
                  placeholder="Share your cultural experience, tradition, or meaningful moment..."
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newStory.isPublic}
                  onChange={(e) => setNewStory(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-400"
                />
                <label htmlFor="isPublic" className="text-white/80">
                  Make this story public for others to discover
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all"
                >
                  Share Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      {!stories ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-2xl font-bold text-white mb-4">No stories yet</h3>
            <p className="text-white/70">
              Be the first to share a cultural story in this category!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div
              key={story._id}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              {/* Story Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {story.author?.displayName || 'Anonymous'}
                    </p>
                    <p className="text-white/60 text-sm">
                      {new Date(story.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {STORY_CATEGORIES.find(cat => cat.id === story.category)?.icon || '📖'}
                  </span>
                </div>
              </div>

              {/* Story Content */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">{story.title}</h3>
                <p className="text-white/80 text-sm line-clamp-4">
                  {story.content}
                </p>
              </div>

              {/* Story Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center space-x-1">
                  {REACTION_TYPES.map((reaction) => (
                    <button
                      key={reaction}
                      onClick={() => handleReaction(story._id, reaction)}
                      className="text-lg hover:scale-110 transition-transform"
                      title={`React with ${reaction}`}
                    >
                      {reaction}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLikeStory(story._id)}
                    className="flex items-center space-x-1 text-white/70 hover:text-pink-400 transition-all"
                  >
                    <span>❤️</span>
                    <span className="text-sm">{story.likes}</span>
                  </button>
                  
                  <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs">
                    {STORY_CATEGORIES.find(cat => cat.id === story.category)?.label || story.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

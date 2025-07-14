import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import React from "react";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl); // Reuse profile upload
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  const stories = useQuery(api.stories.getCulturalStories, {
    category: selectedCategory,
    limit: 20,
  });
  
  const createStory = useMutation(api.stories.createCulturalStory);
  const likeStory = useMutation(api.stories.likeCulturalStory);
  const addReaction = useMutation(api.storyReactions.addStoryReaction);
  const removeReaction = useMutation(api.storyReactions.removeStoryReaction);

  const selectedProfile = useQuery(
    profileUserId ? api.profiles.getUserProfileById : null,
    profileUserId ? { userId: profileUserId } : "skip"
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStory.title.trim() || !newStory.content.trim()) return;
    setUploading(true);
    let imageIds: string[] = [];
    try {
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          const { storageId } = await result.json();
          imageIds.push(storageId);
        }
      }
      await createStory({ ...newStory, images: imageIds });
      toast.success("Story shared successfully!");
      setNewStory({ title: "", content: "", category: "tradition", isPublic: true });
      setSelectedFiles([]);
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Failed to share story");
      console.error(error);
    } finally {
      setUploading(false);
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

              <div>
                <label className="block text-white/80 mb-2">Add Photos or Videos</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden border border-white/20">
                        {file.type.startsWith("image/") ? (
                          <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" controls />
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all"
                  disabled={uploading}
                >
                  {uploading ? "Sharing..." : "Share Story"}
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
                <div
                  className="flex items-center space-x-3 cursor-pointer hover:opacity-80"
                  onClick={() => {
                    setProfileUserId(story.userId);
                    setShowProfileModal(true);
                  }}
                >
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

              {/* Media Gallery */}
              {story.imageUrls && story.imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {story.imageUrls.map((url: string, idx: number) => (
                    <div key={idx} className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden border border-white/20">
                      {url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={url} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={url} alt="story media" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}

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
      {/* Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white/90 rounded-2xl p-8 max-w-lg w-full relative shadow-xl">
            <button
              className="absolute top-3 right-3 text-gray-700 hover:text-black text-2xl"
              onClick={() => setShowProfileModal(false)}
            >
              ✕
            </button>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                {selectedProfile.profileImageUrl ? (
                  <img src={selectedProfile.profileImageUrl} alt={selectedProfile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl">👤</span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedProfile.displayName}</h2>
              <p className="text-gray-700">{selectedProfile.age} • {selectedProfile.location}</p>
              <p className="text-gray-800 text-center">{selectedProfile.bio}</p>
              <div className="w-full grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Languages</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.languages?.map((lang: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-800 rounded text-xs">{lang}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Cultural Background</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.culturalBackground?.map((bg: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-800 rounded text-xs">{bg}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Values</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.values?.map((v: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-800 rounded text-xs">{v}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Food Preferences</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.foodPreferences?.map((f: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-orange-500/20 text-orange-800 rounded text-xs">{f}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Life Goals</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.lifeGoals?.map((g: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-green-500/20 text-green-800 rounded text-xs">{g}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Music Genres</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.musicGenres?.map((m: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-pink-500/20 text-pink-800 rounded text-xs">{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Travel Interests</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.travelInterests?.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-indigo-500/20 text-indigo-800 rounded text-xs">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Traditions</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.traditions?.map((tr: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-yellow-500/20 text-yellow-800 rounded text-xs">{tr}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

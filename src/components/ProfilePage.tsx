import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: "",
    bio: "",
    languages: [] as string[],
    culturalBackground: [] as string[],
    traditions: [] as string[],
    foodPreferences: [] as string[],
    musicGenres: [] as string[],
    travelInterests: [] as string[],
    lifeGoals: [] as string[],
    values: [] as string[],
    relationshipGoals: "",
  });

  const profile = useQuery(api.profiles.getCurrentUserProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);

  const handleEdit = () => {
    if (profile) {
      setEditData({
        displayName: profile.displayName,
        bio: profile.bio,
        languages: profile.languages,
        culturalBackground: profile.culturalBackground,
        traditions: profile.traditions,
        foodPreferences: profile.foodPreferences,
        musicGenres: profile.musicGenres,
        travelInterests: profile.travelInterests,
        lifeGoals: profile.lifeGoals,
        values: profile.values,
        relationshipGoals: profile.relationshipGoals,
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(editData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  const handleArrayChange = (field: keyof typeof editData, value: string) => {
    const currentArray = editData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setEditData(prev => ({ ...prev, [field]: newArray }));
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt={profile.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-3xl">👤</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{profile.displayName}</h1>
              <p className="text-white/70 text-lg">{profile.age} • {profile.location}</p>
              <p className="text-white/60 mt-2">{profile.bio}</p>
            </div>
          </div>
          
          <button
            onClick={isEditing ? handleSave : handleEdit}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all"
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        {isEditing && (
          <div className="space-y-6 border-t border-white/20 pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 mb-2">Display Name</label>
                <input
                  type="text"
                  value={editData.displayName}
                  onChange={(e) => setEditData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Relationship Goals</label>
                <input
                  type="text"
                  value={editData.relationshipGoals}
                  onChange={(e) => setEditData(prev => ({ ...prev, relationshipGoals: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-white/80 mb-2">Bio</label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 h-24"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cultural Information */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">🌍 Cultural Identity</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-white/80 font-medium mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white/80 font-medium mb-2">Cultural Background</h3>
              <div className="flex flex-wrap gap-2">
                {profile.culturalBackground.map((bg, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm">
                    {bg}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white/80 font-medium mb-2">Traditions</h3>
              <div className="flex flex-wrap gap-2">
                {profile.traditions.map((tradition, index) => (
                  <span key={index} className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm">
                    {tradition}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">💫 Interests & Values</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-white/80 font-medium mb-2">Food Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {profile.foodPreferences.map((food, index) => (
                  <span key={index} className="px-3 py-1 bg-orange-500/20 text-orange-200 rounded-full text-sm">
                    {food}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white/80 font-medium mb-2">Music Genres</h3>
              <div className="flex flex-wrap gap-2">
                {profile.musicGenres.map((genre, index) => (
                  <span key={index} className="px-3 py-1 bg-pink-500/20 text-pink-200 rounded-full text-sm">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white/80 font-medium mb-2">Core Values</h3>
              <div className="flex flex-wrap gap-2">
                {profile.values.map((value, index) => (
                  <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm">
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Life Goals */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">🎯 Life Goals & Travel</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white/80 font-medium mb-2">Life Goals</h3>
            <div className="flex flex-wrap gap-2">
              {profile.lifeGoals.map((goal, index) => (
                <span key={index} className="px-3 py-1 bg-yellow-500/20 text-yellow-200 rounded-full text-sm">
                  {goal}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white/80 font-medium mb-2">Travel Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.travelInterests.map((interest, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

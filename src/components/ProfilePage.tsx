import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { CULTURAL_OPTIONS } from "./ProfileSetup";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: "",
    age: 25,
    bio: "",
    location: "",
    languages: [] as string[],
    culturalBackground: [] as string[],
    traditions: [] as string[],
    foodPreferences: [] as string[],
    musicGenres: [] as string[],
    travelInterests: [] as string[],
    lifeGoals: [] as string[],
    values: [] as string[],
    relationshipGoals: "",
    ageRangeMin: 18,
    ageRangeMax: 50,
    maxDistance: 50,
  });

  const profile = useQuery(api.profiles.getCurrentUserProfile);
  const updateProfile = useMutation(api.profiles.upsertProfile);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);
  const updateProfileImage = useMutation(api.profiles.updateProfileImage);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleEdit = () => {
    if (profile) {
      setEditData({
        displayName: profile.displayName,
        age: profile.age,
        bio: profile.bio,
        location: profile.location,
        languages: profile.languages,
        culturalBackground: profile.culturalBackground,
        traditions: profile.traditions,
        foodPreferences: profile.foodPreferences,
        musicGenres: profile.musicGenres,
        travelInterests: profile.travelInterests,
        lifeGoals: profile.lifeGoals,
        values: profile.values,
        relationshipGoals: profile.relationshipGoals,
        ageRangeMin: profile.ageRangeMin,
        ageRangeMax: profile.ageRangeMax,
        maxDistance: profile.maxDistance,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await updateProfileImage({ storageId });
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 px-2 sm:px-0">
      {/* Profile Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-8 border border-white/20">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
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
              
              {/* Image Upload Button */}
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:from-orange-600 hover:to-pink-600 transition-all border-2 border-white">
                {isUploadingImage ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <span className="text-white text-sm">📷</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{profile.displayName}</h1>
              <p className="text-white/70 text-base md:text-lg">{profile.age} • {profile.location}</p>
              <p className="text-white/60 mt-2 text-sm md:text-base">{profile.bio}</p>
            </div>
          </div>
          
          <button
            onClick={isEditing ? handleSave : handleEdit}
            className="px-4 md:px-6 py-2 md:py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all text-sm md:text-base w-full sm:w-auto"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">🌍 Cultural Identity</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-white/80 font-medium mb-2">Languages</h3>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {CULTURAL_OPTIONS.languages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => handleArrayChange('languages', lang)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        editData.languages.includes(lang)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-white/80 font-medium mb-2">Cultural Background</h3>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {CULTURAL_OPTIONS.culturalBackground.map(bg => (
                    <button
                      key={bg}
                      onClick={() => handleArrayChange('culturalBackground', bg)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        editData.culturalBackground.includes(bg)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.culturalBackground.map((bg, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm">
                      {bg}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-white/80 font-medium mb-2">Traditions</h3>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {CULTURAL_OPTIONS.traditions.map(tradition => (
                    <button
                      key={tradition}
                      onClick={() => handleArrayChange('traditions', tradition)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        editData.traditions.includes(tradition)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {tradition}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.traditions.map((tradition, index) => (
                    <span key={index} className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm">
                      {tradition}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">💫 Interests & Values</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-white/80 font-medium mb-2">Food Preferences</h3>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {CULTURAL_OPTIONS.foodPreferences.map(food => (
                    <button
                      key={food}
                      onClick={() => handleArrayChange('foodPreferences', food)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        editData.foodPreferences.includes(food)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {food}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.foodPreferences.map((food, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-500/20 text-orange-200 rounded-full text-sm">
                      {food}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-white/80 font-medium mb-2">Music Genres</h3>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {CULTURAL_OPTIONS.musicGenres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => handleArrayChange('musicGenres', genre)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        editData.musicGenres.includes(genre)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.musicGenres.map((genre, index) => (
                    <span key={index} className="px-3 py-1 bg-pink-500/20 text-pink-200 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-white/80 font-medium mb-2">Core Values</h3>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {CULTURAL_OPTIONS.values.map(value => (
                    <button
                      key={value}
                      onClick={() => handleArrayChange('values', value)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        editData.values.includes(value)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.values.map((value, index) => (
                    <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm">
                      {value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Life Goals */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20">
        <h2 className="text-lg md:text-xl font-bold text-white mb-4">🎯 Life Goals & Travel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <h3 className="text-white/80 font-medium mb-2">Life Goals</h3>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {CULTURAL_OPTIONS.lifeGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => handleArrayChange('lifeGoals', goal)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      editData.lifeGoals.includes(goal)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.lifeGoals.map((goal, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-500/20 text-yellow-200 rounded-full text-sm">
                    {goal}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-white/80 font-medium mb-2">Travel Interests</h3>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {CULTURAL_OPTIONS.travelInterests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleArrayChange('travelInterests', interest)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      editData.travelInterests.includes(interest)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.travelInterests.map((interest, index) => (
                  <span key={index} className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-sm">
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

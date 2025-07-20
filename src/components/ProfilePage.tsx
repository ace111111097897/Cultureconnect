import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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

    zodiacSign: "",
  });

  const profile = useQuery(api.profiles.getCurrentUserProfile);
  const updateProfile = useMutation(api.profiles.upsertProfile);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);
  const updateProfileImage = useMutation(api.profiles.updateProfileImage);
  const updateProfileVideo = useMutation(api.profiles.updateProfileVideo);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Predefined options for different categories
  const culturalOptions = [
    "African", "Asian", "European", "Latin American", "Middle Eastern", "North American", 
    "Pacific Islander", "Caribbean", "Indigenous", "Mixed Heritage", "Other"
  ];

  const languageOptions = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", 
    "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Bengali", "Urdu", "Turkish",
    "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech", "Hungarian",
    "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay", "Tagalog", "Other"
  ];

  const traditionOptions = [
    "Religious Celebrations", "Cultural Festivals", "Family Gatherings", "Traditional Cooking",
    "Art & Crafts", "Music & Dance", "Storytelling", "Meditation", "Yoga", "Tea Ceremony",
    "Traditional Medicine", "Folk Tales", "Seasonal Celebrations", "Coming of Age Rituals",
    "Wedding Traditions", "Funeral Customs", "New Year Celebrations", "Harvest Festivals", "Other"
  ];

  const foodOptions = [
    "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "Greek",
    "Mediterranean", "Middle Eastern", "African", "Caribbean", "Latin American", "Korean",
    "Vietnamese", "Spanish", "German", "American", "British", "Russian", "Turkish", "Other"
  ];

  const musicOptions = [
    "Pop", "Rock", "Hip Hop", "R&B", "Jazz", "Classical", "Country", "Electronic",
    "Folk", "Blues", "Reggae", "Salsa", "Flamenco", "K-Pop", "J-Pop", "Bollywood",
    "Traditional Folk", "World Music", "Gospel", "Punk", "Metal", "Indie", "Reggaeton", "Other"
  ];

  const travelOptions = [
    "Beach Destinations", "Mountain Adventures", "City Exploration", "Cultural Heritage Sites",
    "Food Tours", "Wildlife Safaris", "Historical Sites", "Religious Pilgrimages",
    "Adventure Sports", "Wellness Retreats", "Volunteer Travel", "Backpacking", "Luxury Travel",
    "Road Trips", "Island Hopping", "Desert Expeditions", "Arctic Adventures", "Other"
  ];

  const goalOptions = [
    "Career Growth", "Education", "Family", "Travel", "Health & Fitness", "Creative Pursuits",
    "Community Service", "Financial Independence", "Personal Development", "Cultural Exchange",
    "Language Learning", "Skill Development", "Relationship Building", "Spiritual Growth", "Other"
  ];

  const valueOptions = [
    "Family", "Friendship", "Education", "Creativity", "Adventure", "Peace", "Justice",
    "Compassion", "Honesty", "Respect", "Diversity", "Equality", "Sustainability",
    "Tradition", "Innovation", "Community", "Independence", "Loyalty", "Courage", "Other"
  ];

  const zodiacOptions = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

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
        
        zodiacSign: profile.zodiacSign || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        displayName: editData.displayName,
        age: editData.age,
        bio: editData.bio,
        location: editData.location,
        languages: editData.languages,
        culturalBackground: editData.culturalBackground,
        traditions: editData.traditions,
        foodPreferences: editData.foodPreferences,
        musicGenres: editData.musicGenres,
        travelInterests: editData.travelInterests,
        lifeGoals: editData.lifeGoals,
        values: editData.values,
        relationshipGoals: editData.relationshipGoals,
        zodiacSign: editData.zodiacSign,
        ageRangeMin: editData.ageRangeMin,
        ageRangeMax: editData.ageRangeMax,
        maxDistance: editData.maxDistance,
  
      });
      
      // Show success animation
      setShowSuccess(true);
      toast.success("Profile updated successfully! 🎉");
      
      // Hide success animation after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setIsEditing(false);
      }, 2000);
      
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSaving(false);
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
      toast.success("Profile picture updated! ✨");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingVideo(true);
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await updateProfileVideo({ storageId });
      toast.success("Profile video updated! 🎬");
    } catch (error) {
      toast.error("Failed to upload video");
      console.error(error);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  if (!profile) {
    console.log("ProfilePage: No profile data available");
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white spin-smooth"></div>
          <p className="text-white/70">Loading profile...</p>
          <p className="text-white/50 text-sm">If this takes too long, you may need to create a profile first.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition hover-scale"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  console.log("ProfilePage: Profile data loaded:", profile);

  return (
    <div className="w-full max-w-3xl mx-auto p-2 sm:p-6 overflow-y-auto max-h-screen fade-in">
      {/* Profile Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover-lift">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden float-animation">
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
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:from-orange-600 hover:to-pink-600 transition-all border-2 border-white hover-scale">
                {isUploadingImage ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full spin-smooth"></div>
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
          
          <div className="flex space-x-3 w-full sm:w-auto">
          <button
            onClick={isEditing ? handleSave : handleEdit}
            disabled={isSaving}
            className={`flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all text-sm md:text-base hover-scale ${
              showSuccess ? 'success-bounce' : ''
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
              {isSaving ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full spin-smooth"></div>
                  <span>Saving...</span>
                </span>
              ) : isEditing ? (
                "💾 Save Changes"
              ) : (
                "✏️ Edit Profile"
              )}
            </button>
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all hover-scale"
              >
                ✕ Cancel
          </button>
            )}
          </div>
          </div>

        {/* Basic Info Section */}
        {isEditing ? (
            <div className="grid md:grid-cols-2 gap-6 slide-in-bottom">
              <div>
                <label className="block text-white/80 mb-2">Display Name</label>
                <input
                  type="text"
                  value={editData.displayName}
                  onChange={(e) => setEditData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 hover-glow"
                placeholder="Your display name"
                />
              </div>
              <div>
              <label className="block text-white/80 mb-2">Age</label>
              <input
                type="number"
                value={editData.age}
                onChange={(e) => setEditData(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 hover-glow"
                min="18"
                max="100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/80 mb-2">Location</label>
                <input
                  type="text"
                value={editData.location}
                onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 hover-glow"
                placeholder="City, Country"
                />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/80 mb-2">Bio</label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 h-32 resize-none hover-glow"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Zodiac Sign</label>
              <select
                className="w-full border rounded-lg p-2 hover-glow"
                value={editData.zodiacSign}
                onChange={e => setEditData(prev => ({ ...prev, zodiacSign: e.target.value }))}
              >
                <option value="">Select Zodiac</option>
                {zodiacOptions.map(sign => (
                  <option key={sign} value={sign}>{sign}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 fade-in">
            <div>
              <h3 className="text-white font-semibold mb-2">Basic Info</h3>
              <p className="text-white/70">Display Name: {profile.displayName}</p>
              <p className="text-white/70">Age: {profile.age} years</p>
              <p className="text-white/70">Location: {profile.location}</p>
              <p className="text-white/70">Bio: {profile.bio || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Zodiac Sign</h3>
              <p className="text-white/70">Zodiac Sign: {profile?.zodiacSign || "Not set"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Cultural Identity Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">🌍</span>
          Cultural Identity
        </h2>
        
        {isEditing ? (
          <div className="space-y-6">
            {/* Cultural Background */}
            <div>
              <label className="block text-white/80 mb-3">Cultural Background</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {culturalOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                      type="checkbox"
                      checked={editData.culturalBackground.includes(option)}
                      onChange={() => handleArrayChange('culturalBackground', option)}
                      className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-400"
                    />
                    <span className="text-white/80 text-sm">{option}</span>
                  </label>
                ))}
                </div>
                </div>

            {/* Languages */}
                <div>
              <label className="block text-white/80 mb-3">Languages</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {languageOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                      type="checkbox"
                      checked={editData.languages.includes(option)}
                      onChange={() => handleArrayChange('languages', option)}
                      className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-400"
                  />
                    <span className="text-white/80 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Traditions */}
            <div>
              <label className="block text-white/80 mb-3">Traditions</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {traditionOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editData.traditions.includes(option)}
                      onChange={() => handleArrayChange('traditions', option)}
                      className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-400"
                    />
                    <span className="text-white/80 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-2">Cultural Background</h3>
              <div className="flex flex-wrap gap-2">
                {profile.culturalBackground.map((bg, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm">
                    {bg}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Traditions</h3>
              <div className="flex flex-wrap gap-2">
                {profile.traditions.map((tradition, index) => (
                  <span key={index} className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm">
                    {tradition}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interests & Values Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">💫</span>
          Interests & Values
        </h2>
        
        {isEditing ? (
          <div className="space-y-6">
            {/* Food Preferences */}
            <div>
              <label className="block text-white/80 mb-3">Food Preferences</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {foodOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editData.foodPreferences.includes(option)}
                      onChange={() => handleArrayChange('foodPreferences', option)}
                      className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-400"
                    />
                    <span className="text-white/80 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Music Genres */}
            <div>
              <label className="block text-white/80 mb-3">Music Genres</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {musicOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editData.musicGenres.includes(option)}
                      onChange={() => handleArrayChange('musicGenres', option)}
                      className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-400"
                    />
                    <span className="text-white/80 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Travel Interests */}
            <div>
              <label className="block text-white/80 mb-3">Travel Interests</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {travelOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editData.travelInterests.includes(option)}
                      onChange={() => handleArrayChange('travelInterests', option)}
                      className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-400"
                    />
                    <span className="text-white/80 text-sm">{option}</span>
                  </label>
                ))}
          </div>
        </div>

            {/* Life Goals */}
            <div>
              <label className="block text-white/80 mb-3">Life Goals</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {goalOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editData.lifeGoals.includes(option)}
                      onChange={() => handleArrayChange('lifeGoals', option)}
                      className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-400"
                    />
                    <span className="text-white/80 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Values */}
            <div>
              <label className="block text-white/80 mb-3">Values</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {valueOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editData.values.includes(option)}
                      onChange={() => handleArrayChange('values', option)}
                      className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-400"
                    />
                    <span className="text-white/80 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-2">Food Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {profile.foodPreferences.map((food, index) => (
                  <span key={index} className="px-3 py-1 bg-orange-500/20 text-orange-200 rounded-full text-sm">
                    {food}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Music Genres</h3>
              <div className="flex flex-wrap gap-2">
                {profile.musicGenres.map((music, index) => (
                  <span key={index} className="px-3 py-1 bg-pink-500/20 text-pink-200 rounded-full text-sm min-w-[80px] whitespace-normal">
                    {music}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Travel Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.travelInterests.map((travel, index) => (
                  <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm">
                    {travel}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Life Goals</h3>
              <div className="flex flex-wrap gap-2">
                {profile.lifeGoals.map((goal, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-500/20 text-yellow-200 rounded-full text-sm">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Values</h3>
              <div className="flex flex-wrap gap-2">
                {profile.values.map((value, index) => (
                  <span key={index} className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-sm">
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferences Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">⚙️</span>
          Preferences
        </h2>
        
        {isEditing ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 mb-2">Age Range (Min)</label>
              <input
                type="number"
                value={editData.ageRangeMin}
                onChange={(e) => setEditData(prev => ({ ...prev, ageRangeMin: parseInt(e.target.value) || 18 }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 hover-glow"
                min="18"
                max="100"
              />
            </div>
            <div>
              <label className="block text-white/80 mb-2">Age Range (Max)</label>
              <input
                type="number"
                value={editData.ageRangeMax}
                onChange={(e) => setEditData(prev => ({ ...prev, ageRangeMax: parseInt(e.target.value) || 50 }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 hover-glow"
                min="18"
                max="100"
              />
            </div>
            <div>
              <label className="block text-white/80 mb-2">Max Distance (miles)</label>
              <input
                type="number"
                value={editData.maxDistance}
                onChange={(e) => setEditData(prev => ({ ...prev, maxDistance: parseInt(e.target.value) || 50 }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 hover-glow"
                min="1"
                max="500"
              />
            </div>
            <div>
              <label className="block text-white/80 mb-2">Relationship Goals</label>
              <select
                value={editData.relationshipGoals}
                onChange={(e) => setEditData(prev => ({ ...prev, relationshipGoals: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 hover-glow"
              >
                <option value="">Select relationship goals</option>
                <option value="friendship">Friendship</option>
                <option value="dating">Dating</option>
                <option value="serious_relationship">Serious Relationship</option>
                <option value="marriage">Marriage</option>
                <option value="casual">Casual</option>
                <option value="cultural_exchange">Cultural Exchange</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 fade-in">
            <div>
              <h3 className="text-white font-semibold mb-2">Age Range</h3>
              <p className="text-white/70">{profile.ageRangeMin} - {profile.ageRangeMax} years old</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Max Distance</h3>
              <p className="text-white/70">{profile.maxDistance} miles</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Relationship Goals</h3>
              <p className="text-white/70">{profile.relationshipGoals || "Not specified"}</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

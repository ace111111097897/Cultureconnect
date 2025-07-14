import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

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
    socialLinks: {
      instagram: "",
      twitter: "",
      facebook: "",
      linkedin: "",
      tiktok: "",
      youtube: "",
    },
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
        socialLinks: profile.socialLinks || {
          instagram: "",
          twitter: "",
          facebook: "",
          linkedin: "",
          tiktok: "",
          youtube: "",
        },
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
      toast.success("Profile video updated!");
    } catch (error) {
      toast.error("Failed to upload video");
      console.error(error);
    } finally {
      setIsUploadingVideo(false);
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

        {/* Profile Video */}
        {profile.profileVideoUrl && (
          <div className="mb-6">
            <h3 className="text-white/80 font-medium mb-3">Profile Video</h3>
            <div className="relative">
              <video
                src={profile.profileVideoUrl}
                className="w-full max-w-md h-48 object-cover rounded-xl"
                controls
                muted
              />
              <label className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:from-blue-600 hover:to-cyan-600 transition-all border-2 border-white">
                {isUploadingVideo ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <span className="text-white text-sm">📹</span>
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={isUploadingVideo}
                />
              </label>
            </div>
          </div>
        )}

        {/* Video Upload Button (if no video exists) */}
        {!profile.profileVideoUrl && (
          <div className="mb-6">
            <h3 className="text-white/80 font-medium mb-3">Add Profile Video</h3>
            <label className="block w-full max-w-md h-32 border-2 border-dashed border-white/30 rounded-xl flex items-center justify-center cursor-pointer hover:border-white/50 transition-all">
              {isUploadingVideo ? (
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl mb-2">📹</div>
                  <p className="text-white/60 text-sm">Click to upload video</p>
                </div>
              )}
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                disabled={isUploadingVideo}
              />
            </label>
          </div>
        )}

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
                placeholder="Tell us about yourself, your cultural background, and what you're looking for..."
              />
            </div>

            {/* Social Media Links */}
            <div>
              <label className="block text-white/80 mb-4">Social Media Links</label>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 mb-1 text-sm">Instagram</label>
                  <input
                    type="url"
                    value={editData.socialLinks.instagram}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    placeholder="https://instagram.com/username"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1 text-sm">Twitter</label>
                  <input
                    type="url"
                    value={editData.socialLinks.twitter}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1 text-sm">Facebook</label>
                  <input
                    type="url"
                    value={editData.socialLinks.facebook}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    placeholder="https://facebook.com/username"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1 text-sm">LinkedIn</label>
                  <input
                    type="url"
                    value={editData.socialLinks.linkedin}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1 text-sm">TikTok</label>
                  <input
                    type="url"
                    value={editData.socialLinks.tiktok}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, tiktok: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    placeholder="https://tiktok.com/@username"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1 text-sm">YouTube</label>
                  <input
                    type="url"
                    value={editData.socialLinks.youtube}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    placeholder="https://youtube.com/@username"
                  />
                </div>
              </div>
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

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">💫 Interests & Values</h2>
          
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
                {profile.musicGenres.map((music, index) => (
                  <span key={index} className="px-3 py-1 bg-pink-500/20 text-pink-200 rounded-full text-sm">
                    {music}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white/80 font-medium mb-2">Travel Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.travelInterests.map((travel, index) => (
                  <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm">
                    {travel}
                  </span>
                ))}
              </div>
            </div>

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
              <h3 className="text-white/80 font-medium mb-2">Values</h3>
              <div className="flex flex-wrap gap-2">
                {profile.values.map((value, index) => (
                  <span key={index} className="px-3 py-1 bg-emerald-500/20 text-emerald-200 rounded-full text-sm">
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Links Display */}
      {profile.socialLinks && Object.values(profile.socialLinks).some(url => url) && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">📱 Social Media</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(profile.socialLinks).map(([platform, url]) => {
              if (!url) return null;
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-all flex items-center space-x-2"
                >
                  <span className="text-lg">
                    {platform === 'instagram' ? '📷' : 
                     platform === 'twitter' ? '🐦' : 
                     platform === 'facebook' ? '📘' : 
                     platform === 'linkedin' ? '💼' : 
                     platform === 'tiktok' ? '🎵' : 
                     platform === 'youtube' ? '📺' : '🔗'}
                  </span>
                  <span className="capitalize">{platform}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

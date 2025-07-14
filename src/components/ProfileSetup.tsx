import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export const CULTURAL_OPTIONS = {
  languages: ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Arabic", "Chinese", "Japanese", "Korean", "Hindi", "Russian", "Other"],
  culturalBackground: ["African", "Asian", "European", "Latin American", "Middle Eastern", "Native American", "Pacific Islander", "Caribbean", "American", "Mixed Heritage"],
  traditions: ["Religious ceremonies", "Family gatherings", "Cultural festivals", "Food traditions", "Music and dance", "Storytelling", "Art and crafts"],
  foodPreferences: ["Mediterranean", "Asian", "Latin American", "African", "Middle Eastern", "European", "American", "Fusion", "Vegetarian", "Vegan"],
  musicGenres: ["Pop", "Rock", "Hip Hop", "R&B", "Jazz", "Classical", "Folk", "Electronic", "Reggae", "Country", "World Music"],
  travelInterests: ["Cultural immersion", "Food tours", "Historical sites", "Music festivals", "Art galleries", "Nature exploration", "Adventure travel"],
  lifeGoals: ["Career advancement", "Family building", "Travel the world", "Learn new languages", "Start a business", "Give back to community", "Personal growth"],
  values: ["Family first", "Community service", "Personal growth", "Spiritual connection", "Cultural preservation", "Environmental consciousness", "Social justice"],
  relationshipGoals: ["Long-term partnership", "Marriage", "Friendship", "Cultural exchange", "Professional networking", "Activity partner"]
};

export function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: "",
    age: 25,
    bio: "",
    location: "",
    email: "",
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

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const upsertProfile = useMutation(api.profiles.upsertProfile);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);
  const updateProfileImage = useMutation(api.profiles.updateProfileImage);

  const handleArrayChange = (field: keyof typeof formData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      await upsertProfile(formData);
      
      if (selectedImage) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        const { storageId } = await result.json();
        await updateProfileImage({ storageId });
      }
      
      toast.success("Profile created successfully! 🎉");
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
            
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center border-4 border-white/20 overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl">👤</span>
                )}
              </div>
              <div className="text-center">
                <label className="cursor-pointer px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:from-orange-600 hover:to-pink-600 transition-all">
                  {selectedImage ? "Change Photo" : "Add Profile Photo"}
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>
                <p className="text-white/60 text-sm mt-2">📸 Add a photo to help others connect with you</p>
              </div>
            </div>
            
            <div>
              <label className="block text-white/80 mb-2">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="How should others see your name?"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                min="18"
                max="100"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="City, State/Country"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">Email (for notifications)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="your.email@example.com"
              />
              <p className="text-white/60 text-sm mt-1">
                📧 Get notified about matches, friend requests, and cultural events
              </p>
            </div>

            <div>
              <label className="block text-white/80 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 h-24"
                placeholder="Tell others about yourself and what makes you unique..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Cultural Identity</h2>
            
            <div>
              <label className="block text-white/80 mb-3">Languages You Speak</label>
              <div className="grid grid-cols-2 gap-2">
                {CULTURAL_OPTIONS.languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => handleArrayChange('languages', lang)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.languages.includes(lang)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 mb-3">Cultural Background</label>
              <div className="grid grid-cols-2 gap-2">
                {CULTURAL_OPTIONS.culturalBackground.map(bg => (
                  <button
                    key={bg}
                    onClick={() => handleArrayChange('culturalBackground', bg)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.culturalBackground.includes(bg)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 mb-3">Important Traditions</label>
              <div className="grid grid-cols-2 gap-2">
                {CULTURAL_OPTIONS.traditions.map(tradition => (
                  <button
                    key={tradition}
                    onClick={() => handleArrayChange('traditions', tradition)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.traditions.includes(tradition)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {tradition}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Interests & Values</h2>
            
            <div>
              <label className="block text-white/80 mb-3">Food Preferences</label>
              <div className="grid grid-cols-2 gap-2">
                {CULTURAL_OPTIONS.foodPreferences.map(food => (
                  <button
                    key={food}
                    onClick={() => handleArrayChange('foodPreferences', food)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.foodPreferences.includes(food)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {food}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 mb-3">Music You Love</label>
              <div className="grid grid-cols-2 gap-2">
                {CULTURAL_OPTIONS.musicGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => handleArrayChange('musicGenres', genre)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.musicGenres.includes(genre)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 mb-3">Core Values</label>
              <div className="grid grid-cols-2 gap-2">
                {CULTURAL_OPTIONS.values.map(value => (
                  <button
                    key={value}
                    onClick={() => handleArrayChange('values', value)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.values.includes(value)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Goals & Preferences</h2>
            
            <div>
              <label className="block text-white/80 mb-3">Life Goals</label>
              <div className="grid grid-cols-2 gap-2">
                {CULTURAL_OPTIONS.lifeGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => handleArrayChange('lifeGoals', goal)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.lifeGoals.includes(goal)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 mb-3">What are you looking for?</label>
              <div className="grid grid-cols-2 gap-2">
                {CULTURAL_OPTIONS.relationshipGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => setFormData(prev => ({ ...prev, relationshipGoals: goal }))}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.relationshipGoals === goal
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 mb-2">Age Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={formData.ageRangeMin}
                    onChange={(e) => setFormData(prev => ({ ...prev, ageRangeMin: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                    min="18"
                  />
                  <span className="text-white/80 self-center">to</span>
                  <input
                    type="number"
                    value={formData.ageRangeMax}
                    onChange={(e) => setFormData(prev => ({ ...prev, ageRangeMax: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Max Distance (miles)</label>
                <input
                  type="number"
                  value={formData.maxDistance}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                  min="1"
                  max="500"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white/60">Step {step} of 4</span>
            <span className="text-white/60">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-400 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {renderStep()}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 transition-all"
            >
              {isUploading ? "Creating Profile..." : "Complete Profile"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

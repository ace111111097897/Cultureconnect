import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function ExploreSection() {
  const reels = useQuery(api.reels.getPublicReels, { limit: 20 }) || [];
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);
  const createReel = useMutation(api.reels.createReel);
  const generateVideoUploadUrl = useMutation(api.reels.generateVideoUploadUrl);

  const [current, setCurrent] = useState(0);
  const [showPost, setShowPost] = useState(false);
  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const getAvatarUrl = (user: any) => {
    if (user?.profileImageUrl) return user.profileImageUrl;
    if (user?.profileImage) return user.profileImage; // fallback if you have a URL
    return "https://randomuser.me/api/portraits/lego/1.jpg";
  };

  // Scroll to next/prev reel
  const handleScroll = (dir: "up" | "down") => {
    setCurrent((idx) => {
      let next = dir === "down" ? idx + 1 : idx - 1;
      if (next < 0) next = 0;
      if (next >= reels.length) next = reels.length - 1;
      return next;
    });
  };

  // Post a new reel
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo || !caption.trim()) return;
    setUploading(true);
    try {
      // 1. Get upload URL
      const uploadResult = await generateVideoUploadUrl();
      const url = typeof uploadResult === 'object' && uploadResult && 'url' in uploadResult ? (uploadResult as any).url as string : '';
      if (!url) throw new Error('Failed to get upload URL');
      // 2. Upload video
      await fetch(url, {
        method: "POST",
        headers: {},
        body: newVideo,
      });
      // 3. Extract storageId from upload URL
      const storageId = (url.split("/").pop() || "") as string;
      // 4. Create reel in DB
      await createReel({
        video: storageId as Id<'_storage'>,
        caption,
        isPublic: true,
      });
      setShowPost(false);
      setNewVideo(null);
      setCaption("");
      setCurrent(0);
    } catch (err) {
      alert("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative h-[90vh] w-full flex flex-col items-center justify-center bg-black">
      {/* Post button */}
      <button
        className="absolute top-6 right-6 z-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600"
        onClick={() => setShowPost(true)}
      >
        + Post Reel
      </button>

      {/* Reels feed */}
      <div className="relative w-full h-full flex-1 flex items-center justify-center overflow-hidden">
        {reels.map((reel, idx) => (
          <div
            key={reel._id}
            className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-end transition-transform duration-500 ${
              idx === current ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none"
            }`}
            style={{
              transform: `translateY(${(idx - current) * 100}%)`,
            }}
          >
            <video
              ref={el => { videoRefs.current[idx] = el; }}
              src={reel.videoUrl as string}
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
              autoPlay={idx === current}
              loop
              muted
              controls={false}
              playsInline
            />
            {/* Overlay info */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img src={getAvatarUrl(reel.user)} alt={reel.user?.displayName || "User"} className="w-10 h-10 rounded-full border-2 border-white" />
                <span className="text-white font-bold text-lg">{reel.user?.displayName || "User"}</span>
                <span className="text-white/70 text-xs ml-2">{new Date(reel.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-white text-base mb-2">{reel.caption}</div>
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-1 text-white/80 hover:text-pink-400 transition-all">
                  <span>❤️</span>
                  <span className="text-sm">{reel.likes}</span>
                </button>
                <button className="flex items-center gap-1 text-white/80 hover:text-blue-400 transition-all">
                  <span>💬</span>
                  <span className="text-sm">{reel.comments}</span>
                </button>
                <button className="flex items-center gap-1 text-white/80 hover:text-green-400 transition-all">
                  <span>🔗</span>
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Up/Down navigation */}
      <div className="absolute left-4 top-1/2 z-20 flex flex-col gap-4">
        <button
          onClick={() => handleScroll("up")}
          className="bg-white/20 hover:bg-white/40 text-white rounded-full p-2 shadow-lg"
          disabled={current === 0}
        >
          ▲
        </button>
        <button
          onClick={() => handleScroll("down")}
          className="bg-white/20 hover:bg-white/40 text-white rounded-full p-2 shadow-lg"
          disabled={current === reels.length - 1}
        >
          ▼
        </button>
      </div>

      {/* Post Reel Modal */}
      {showPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowPost(false)}>✕</button>
            <div className="text-xl font-bold mb-4">Post a New Reel</div>
            <form className="space-y-4" onSubmit={handlePost}>
              <input
                className="w-full border rounded-lg p-2"
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={e => setNewVideo(e.target.files?.[0] || null)}
                required
              />
              <textarea
                className="w-full border rounded-lg p-2"
                placeholder="Caption"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                rows={3}
                required
              />
              <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition" disabled={uploading}>{uploading ? "Posting..." : "Post"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
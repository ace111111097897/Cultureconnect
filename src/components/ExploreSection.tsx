import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function ExploreSection() {
  const createReel = useMutation(api.reels.createReel);
  const generateVideoUploadUrl = useMutation(api.reels.generateVideoUploadUrl);

  const [showPost, setShowPost] = useState(false);
  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post a new reel
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo || !caption.trim()) return;
    setUploading(true);
    setError(null);
    try {
      const uploadResult = await generateVideoUploadUrl();
      const url = typeof uploadResult === 'object' && uploadResult && 'url' in uploadResult ? (uploadResult as any).url as string : '';
      if (!url) throw new Error('Failed to get upload URL');
      await fetch(url, {
        method: "POST",
        headers: {},
        body: newVideo,
      });
      const storageId = (url.split("/").pop() || "") as string;
      await createReel({
        video: storageId as Id<'_storage'>,
        caption,
        isPublic: true,
      });
      setShowPost(false);
      setNewVideo(null);
      setCaption("");
    } catch (err) {
      setError("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[90vh] w-full bg-black">
      <button
        className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600"
        onClick={() => setShowPost(true)}
      >
        + Submit a Video
      </button>
      {showPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowPost(false)}>✕</button>
            <div className="text-xl font-bold mb-4">Submit a Video</div>
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
              <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition" disabled={uploading}>{uploading ? "Submitting..." : "Submit"}</button>
              {error && <div className="text-red-500 mt-2">{error}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
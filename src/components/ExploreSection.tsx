import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import React from "react";

function CommentsModal({ reelId, open, onClose }: { reelId: Id<'reels'>, open: boolean, onClose: () => void }) {
  const comments = useQuery(api.reels.getComments, { reelId });
  const addComment = useMutation(api.reels.addComment);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    setError(null);
    try {
      await addComment({ reelId, text });
      setText("");
    } catch (err) {
      setError("Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative flex flex-col max-h-[80vh]">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>✕</button>
        <div className="text-xl font-bold mb-4">Comments</div>
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {comments === undefined ? (
            <div className="text-gray-500">Loading...</div>
          ) : comments.length === 0 ? (
            <div className="text-gray-500">No comments yet. Be the first!</div>
          ) : comments.map((c: any) => (
            <div key={c._id} className="flex items-start gap-3">
              <img src={c.user?.profileImageUrl || c.user?.profileImage || "https://randomuser.me/api/portraits/lego/1.jpg"} className="w-8 h-8 rounded-full border" alt="avatar" />
              <div>
                <div className="font-semibold text-sm">{c.user?.displayName || "User"}</div>
                <div className="text-gray-800 text-sm">{c.text}</div>
                <div className="text-gray-400 text-xs">{new Date(c.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handlePost} className="flex gap-2 mt-2">
          <input
            className="flex-1 border rounded-lg p-2"
            placeholder="Add a comment..."
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={posting}
            maxLength={300}
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition" disabled={posting || !text.trim()}>{posting ? "Posting..." : "Post"}</button>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
}

function ReelCard({ reel, idx, current, videoRefs, onLike, likeLoading, onShowComments }: any) {
  const likeStatus = useQuery(api.reels.getReelLikeStatus, { reelId: reel._id });
  const getAvatarUrl = (user: any) => {
    if (user?.profileImageUrl) return user.profileImageUrl;
    if (user?.profileImage) return user.profileImage;
    return "https://randomuser.me/api/portraits/lego/1.jpg";
  };
  return (
    <div
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
          <button
            className={`flex items-center gap-1 text-white/80 transition-all ${likeStatus?.liked ? "text-pink-400" : "hover:text-pink-400"}`}
            onClick={() => onLike(reel._id, !!likeStatus?.liked)}
            disabled={likeLoading[reel._id]}
          >
            <span>❤️</span>
            <span className="text-sm">{likeStatus?.likeCount ?? reel.likeCount ?? 0}</span>
          </button>
          <button className="flex items-center gap-1 text-white/80 hover:text-blue-400 transition-all" onClick={() => onShowComments(reel._id)}>
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
  );
}

export function ExploreSection() {
  const reels = useQuery(api.reels.getReels, { limit: 20 });
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);
  const createReel = useMutation(api.reels.createReel);
  const generateVideoUploadUrl = useMutation(api.reels.generateVideoUploadUrl);
  const likeReel = useMutation(api.reels.likeReel);
  const unlikeReel = useMutation(api.reels.unlikeReel);

  const [current, setCurrent] = useState(0);
  const [showPost, setShowPost] = useState(false);
  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [commentModalReel, setCommentModalReel] = useState<Id<'reels'> | null>(null);

  // Scroll to next/prev reel
  const handleScroll = (dir: "up" | "down") => {
    setCurrent((idx) => {
      let next = dir === "down" ? idx + 1 : idx - 1;
      if (next < 0) next = 0;
      if (!reels || next >= reels.length) next = reels ? reels.length - 1 : 0;
      return next;
    });
  };

  // Like/unlike a reel
  const handleLike = async (reelId: Id<'reels'>, liked: boolean) => {
    setLikeLoading((prev) => ({ ...prev, [reelId]: true }));
    try {
      if (liked) {
        await unlikeReel({ reelId });
      } else {
        await likeReel({ reelId });
      }
    } catch (e) {
      // Optionally show error
    } finally {
      setLikeLoading((prev) => ({ ...prev, [reelId]: false }));
    }
  };

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
      setCurrent(0);
    } catch (err) {
      setError("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  // Loading state
  if (reels === undefined) {
    return (
      <div className="flex items-center justify-center h-[90vh] w-full bg-black">
        <div className="text-white text-xl animate-pulse">Loading reels...</div>
      </div>
    );
  }

  // Error or empty state
  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] w-full bg-black">
        <div className="text-white text-2xl font-bold mb-4">No reels yet!</div>
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600"
          onClick={() => setShowPost(true)}
        >
          + Be the first to post a Reel
        </button>
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
                {error && <div className="text-red-500 mt-2">{error}</div>}
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

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
        {reels.map((reel: any, idx: number) => (
          <ReelCard
            key={reel._id}
            reel={reel}
            idx={idx}
            current={current}
            videoRefs={videoRefs}
            onLike={handleLike}
            likeLoading={likeLoading}
            onShowComments={setCommentModalReel}
          />
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
              {error && <div className="text-red-500 mt-2">{error}</div>}
            </form>
          </div>
        </div>
      )}
      {/* Comments Modal */}
      {commentModalReel && (
        <CommentsModal
          reelId={commentModalReel}
          open={!!commentModalReel}
          onClose={() => setCommentModalReel(null)}
        />
      )}
    </div>
  );
} 
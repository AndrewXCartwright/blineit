import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatRelativeTime } from "@/lib/formatters";

interface VideoPost {
  id: string;
  content: string;
  video_url: string;
  created_at: string;
  user?: {
    display_name: string;
    avatar_url: string | null;
  };
}

const TrendingVideo = () => {
  const navigate = useNavigate();
  const [videoPost, setVideoPost] = useState<VideoPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestVideo = async () => {
      try {
        // Query latest post with a video
        const { data, error } = await (supabase as any)
          .from("user_posts")
          .select("id, content, video_url, created_at, user_id")
          .not("video_url", "is", null)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          setVideoPost(null);
          return;
        }

        // Fetch user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", data.user_id)
          .single();

        setVideoPost({
          ...data,
          user: profile || { display_name: "Unknown", avatar_url: null },
        });
      } catch (err) {
        console.error("Error fetching latest video:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestVideo();
  }, []);

  const handleVideoClick = () => {
    if (videoPost) {
      navigate(`/post/${videoPost.id}`);
    }
  };

  // Extract title from content (first line or first 50 chars)
  const getTitle = (content: string) => {
    const firstLine = content.split("\n")[0];
    return firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine;
  };

  return (
    <div className="mb-5">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-foreground">
          🔥 Trending Now
        </span>
        <button
          onClick={() => navigate("/community")}
          className="bg-transparent border-none text-[11px] text-[#00d4aa] cursor-pointer"
        >
          See All →
        </button>
      </div>

      {/* Video Card */}
      {loading ? (
        <div className="bg-card border border-border rounded-2xl h-[200px] flex items-center justify-center">
          <span className="text-muted-foreground text-xs">Loading...</span>
        </div>
      ) : videoPost ? (
        <div
          onClick={handleVideoClick}
          className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer"
        >
          {/* Thumbnail Area */}
          <div className="h-[140px] bg-gradient-to-br from-muted to-muted/50 relative flex items-center justify-center">
            {/* Video thumbnail preview */}
            <video
              src={videoPost.video_url}
              className="w-full h-full object-cover absolute top-0 left-0"
              muted
              preload="metadata"
            />

            {/* NEW Badge */}
            <div className="absolute top-2.5 left-2.5 bg-[#00d4aa] px-2 py-1 rounded text-[9px] font-semibold text-black z-[2]">
              NEW
            </div>

            {/* Play Button */}
            <div className="w-[50px] h-[50px] rounded-full bg-[#00d4aa]/90 flex items-center justify-center z-[2]">
              <Play size={24} className="text-black" fill="black" />
            </div>
          </div>

          {/* Video Info */}
          <div className="p-3">
            <p className="text-[13px] font-semibold text-foreground leading-tight">
              {getTitle(videoPost.content)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {videoPost.user?.display_name} • {formatRelativeTime(videoPost.created_at)} • Community
            </p>
          </div>
        </div>
      ) : (
        /* Fallback - No videos */
        <div
          onClick={() => navigate("/community")}
          className="bg-card border border-border rounded-2xl py-10 px-5 text-center cursor-pointer"
        >
          <p className="text-[13px] text-muted-foreground">
            No videos yet - be the first to post!
          </p>
          <p className="text-[11px] text-[#00d4aa] mt-2">
            Go to Community →
          </p>
        </div>
      )}
    </div>
  );
};

export default TrendingVideo;

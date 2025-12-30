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
    <div style={{ marginBottom: "20px" }}>
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>
          🔥 Trending Now
        </span>
        <button
          onClick={() => navigate("/community")}
          style={{
            background: "none",
            border: "none",
            fontSize: "11px",
            color: "#00d4aa",
            cursor: "pointer",
          }}
        >
          See All →
        </button>
      </div>

      {/* Video Card */}
      {loading ? (
        <div
          style={{
            background: "#1e1e32",
            border: "1px solid #2a2a4a",
            borderRadius: "16px",
            height: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#666", fontSize: "12px" }}>Loading...</span>
        </div>
      ) : videoPost ? (
        <div
          onClick={handleVideoClick}
          style={{
            background: "#1e1e32",
            border: "1px solid #2a2a4a",
            borderRadius: "16px",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          {/* Thumbnail Area */}
          <div
            style={{
              height: "140px",
              background: "linear-gradient(135deg, #2a2a4a 0%, #1a1a2e 100%)",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Video thumbnail preview */}
            <video
              src={videoPost.video_url}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              muted
              preload="metadata"
            />

            {/* NEW Badge */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                background: "#00d4aa",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "9px",
                fontWeight: 600,
                color: "black",
                zIndex: 2,
              }}
            >
              NEW
            </div>

            {/* Play Button */}
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "rgba(0, 212, 170, 0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <Play size={24} color="black" fill="black" />
            </div>
          </div>

          {/* Video Info */}
          <div style={{ padding: "12px" }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "white",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {getTitle(videoPost.content)}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#666",
                margin: 0,
                marginTop: "6px",
              }}
            >
              {videoPost.user?.display_name} • {formatRelativeTime(videoPost.created_at)} • Community
            </p>
          </div>
        </div>
      ) : (
        /* Fallback - No videos */
        <div
          onClick={() => navigate("/community")}
          style={{
            background: "#1e1e32",
            border: "1px solid #2a2a4a",
            borderRadius: "16px",
            padding: "40px 20px",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "#666",
              margin: 0,
            }}
          >
            No videos yet - be the first to post!
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "#00d4aa",
              margin: 0,
              marginTop: "8px",
            }}
          >
            Go to Community →
          </p>
        </div>
      )}
    </div>
  );
};

export default TrendingVideo;

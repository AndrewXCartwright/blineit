import { Play } from "lucide-react";

interface TrendingVideoProps {
  thumbnailUrl?: string;
  title: string;
  views: string;
  category: string;
  isLive?: boolean;
  onPlay: () => void;
  onSeeAll: () => void;
}

const TrendingVideo = ({
  thumbnailUrl,
  title,
  views,
  category,
  isLive = false,
  onPlay,
  onSeeAll,
}: TrendingVideoProps) => {
  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold" style={{ fontSize: "14px" }}>
          🔥 Trending Now
        </span>
        <button
          onClick={onSeeAll}
          style={{ fontSize: "11px", color: "#00d4aa" }}
        >
          See All →
        </button>
      </div>

      {/* Video Card */}
      <div
        className="overflow-hidden"
        style={{
          background: "#1e1e32",
          border: "1px solid #2a2a4a",
          borderRadius: "16px",
        }}
      >
        {/* Thumbnail Area */}
        <div
          className="relative flex items-center justify-center cursor-pointer"
          style={{
            height: "140px",
            background: thumbnailUrl
              ? `url(${thumbnailUrl}) center/cover`
              : "linear-gradient(135deg, #2a2a4a 0%, #1a1a2e 100%)",
          }}
          onClick={onPlay}
        >
          {/* LIVE Badge */}
          {isLive && (
            <span
              className="absolute font-semibold"
              style={{
                top: "10px",
                left: "10px",
                background: "#ff4757",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "9px",
                color: "white",
              }}
            >
              LIVE
            </span>
          )}

          {/* Play Button */}
          <button
            onClick={onPlay}
            className="flex items-center justify-center"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "rgba(0, 212, 170, 0.9)",
            }}
          >
            <Play size={22} color="white" fill="white" />
          </button>
        </div>

        {/* Video Info */}
        <div style={{ padding: "12px" }}>
          <p
            className="font-semibold text-white mb-1"
            style={{ fontSize: "13px" }}
          >
            {title}
          </p>
          <p style={{ fontSize: "11px", color: "#666" }}>
            {views} views • {category}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrendingVideo;

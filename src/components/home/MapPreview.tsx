import { useNavigate } from "react-router-dom";

interface MapPreviewProps {
  propertyCount?: number;
  distance?: number;
  onExplore?: () => void;
}

const mapDots = [
  { top: "30%", left: "25%" },
  { top: "50%", left: "60%" },
  { top: "70%", left: "40%" },
  { top: "25%", left: "75%" },
];

const MapPreview = ({ 
  propertyCount = 7, 
  distance = 25,
  onExplore 
}: MapPreviewProps) => {
  const navigate = useNavigate();

  const handleExplore = () => {
    if (onExplore) {
      onExplore();
    } else {
      navigate("/discover");
    }
  };

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="mb-3">
        <span className="font-semibold" style={{ fontSize: "14px" }}>
          📍 Near You
        </span>
      </div>

      {/* Map Card */}
      <div
        className="overflow-hidden"
        style={{
          background: "#1e1e32",
          border: "1px solid #2a2a4a",
          borderRadius: "16px",
        }}
      >
        {/* Map Preview Area */}
        <div
          className="relative"
          style={{
            height: "120px",
            background: "linear-gradient(135deg, #1a2a3a 0%, #0f1a2a 100%)",
          }}
        >
          {/* Property Dots */}
          {mapDots.map((dot, index) => (
            <div
              key={index}
              className="absolute animate-pulse"
              style={{
                top: dot.top,
                left: dot.left,
                width: "10px",
                height: "10px",
                background: "#00d4aa",
                borderRadius: "50%",
                boxShadow: "0 0 10px #00d4aa",
              }}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div
          className="flex items-center justify-between"
          style={{ padding: "12px" }}
        >
          {/* Left side */}
          <div>
            <p
              className="font-semibold text-white"
              style={{ fontSize: "12px" }}
            >
              Invest in Your Neighborhood
            </p>
            <p style={{ fontSize: "10px", color: "#666" }}>
              {propertyCount} properties within {distance} miles
            </p>
          </div>

          {/* Right side - EXPLORE button */}
          <button
            onClick={handleExplore}
            className="font-semibold"
            style={{
              background: "#00d4aa",
              color: "#000",
              padding: "8px 14px",
              borderRadius: "20px",
              fontSize: "10px",
              border: "none",
            }}
          >
            EXPLORE
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPreview;

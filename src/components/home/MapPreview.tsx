import { useNavigate } from "react-router-dom";

const mapDots = [
  { top: "30%", left: "25%" },
  { top: "50%", left: "60%" },
  { top: "70%", left: "40%" },
  { top: "25%", left: "75%" },
];

const MapPreview = () => {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: "16px" }}>
      {/* Section Header */}
      <div style={{ marginBottom: "12px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>
          📍 Near You
        </span>
      </div>

      {/* Map Card */}
      <div
        style={{
          background: "#1e1e32",
          border: "1px solid #2a2a4a",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {/* Map Preview Area */}
        <div
          style={{
            height: "120px",
            background: "linear-gradient(135deg, #1a2a3a 0%, #0f1a2a 100%)",
            position: "relative",
          }}
        >
          {/* Property Dots */}
          {mapDots.map((dot, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                top: dot.top,
                left: dot.left,
                width: "10px",
                height: "10px",
                background: "#00d4aa",
                borderRadius: "50%",
                boxShadow: "0 0 10px #00d4aa",
                animation: "pulse 2s infinite",
              }}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div
          style={{
            padding: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Left side */}
          <div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "white",
                margin: 0,
              }}
            >
              Invest in Your Neighborhood
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "#666",
                margin: 0,
                marginTop: "2px",
              }}
            >
              7 properties within 25 miles
            </p>
          </div>

          {/* Right side - EXPLORE button */}
          <button
            onClick={() => navigate("/explore")}
            style={{
              background: "#00d4aa",
              color: "#000",
              padding: "8px 14px",
              borderRadius: "20px",
              fontSize: "10px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
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

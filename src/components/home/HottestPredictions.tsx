import { useNavigate } from "react-router-dom";

interface Prediction {
  question: string;
  yesOdds: number;
  noOdds: number;
  volume: string;
}

const predictions: Prediction[] = [
  { question: "Will Austin property hit 150% ROI by Q2 2026?", yesOdds: 67, noOdds: 33, volume: "$45K" },
  { question: "Miami occupancy rate above 95% in Jan?", yesOdds: 82, noOdds: 18, volume: "$28K" },
  { question: "GreenGrid IPO by end of 2026?", yesOdds: 23, noOdds: 77, volume: "$12K" },
];

const HottestPredictions = () => {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: "16px" }}>
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
          🎯 Hottest Predictions
        </span>
        <button
          onClick={() => navigate("/predictions")}
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

      {/* Scroll Container */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "5px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="hottest-predictions-scroll"
      >
        <style>{`
          .hottest-predictions-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {predictions.map((prediction, index) => (
          <div
            key={index}
            style={{
              minWidth: "200px",
              flexShrink: 0,
              background: "#1e1e32",
              border: "1px solid #2a2a4a",
              borderRadius: "12px",
              padding: "14px",
            }}
          >
            {/* Question */}
            <p
              style={{
                fontSize: "11px",
                color: "white",
                lineHeight: 1.4,
                marginBottom: "10px",
                margin: 0,
              }}
            >
              {prediction.question}
            </p>

            {/* Odds Row */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "10px",
              }}
            >
              <button
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: "rgba(0, 212, 170, 0.2)",
                  color: "#00d4aa",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                YES {prediction.yesOdds}%
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: "rgba(255, 71, 87, 0.2)",
                  color: "#ff4757",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                NO {prediction.noOdds}%
              </button>
            </div>

            {/* Volume */}
            <p
              style={{
                fontSize: "9px",
                color: "#666",
                marginTop: "8px",
                margin: 0,
              }}
            >
              Volume: {prediction.volume}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HottestPredictions;

import { useNavigate } from "react-router-dom";

interface Prediction {
  question: string;
  yesOdds: number;
  noOdds: number;
  volume: string;
}

interface HottestPredictionsProps {
  onSeeAll?: () => void;
}

const predictions: Prediction[] = [
  { question: "Will Austin property hit 150% ROI by Q2 2026?", yesOdds: 67, noOdds: 33, volume: "$45K" },
  { question: "Miami occupancy rate above 95% in Jan?", yesOdds: 82, noOdds: 18, volume: "$28K" },
  { question: "GreenGrid IPO by end of 2026?", yesOdds: 23, noOdds: 77, volume: "$12K" },
];

const HottestPredictions = ({ onSeeAll }: HottestPredictionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold" style={{ fontSize: "14px" }}>
          🎯 Hottest Predictions
        </span>
        <button
          onClick={onSeeAll || (() => navigate("/predict"))}
          style={{ fontSize: "11px", color: "#00d4aa" }}
        >
          See All →
        </button>
      </div>

      {/* Scroll Container */}
      <div
        className="flex gap-2.5 overflow-x-auto pb-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`
          .predictions-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {predictions.map((prediction, index) => (
          <div
            key={index}
            className="flex-shrink-0"
            style={{
              minWidth: "200px",
              background: "#1e1e32",
              border: "1px solid #2a2a4a",
              borderRadius: "12px",
              padding: "14px",
            }}
          >
            {/* Question */}
            <p
              className="text-white mb-2.5"
              style={{
                fontSize: "11px",
                lineHeight: 1.4,
              }}
            >
              {prediction.question}
            </p>

            {/* Odds Row */}
            <div className="flex gap-2">
              <button
                className="flex-1 font-semibold"
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontSize: "11px",
                  background: "rgba(0, 212, 170, 0.2)",
                  color: "#00d4aa",
                  border: "none",
                }}
              >
                YES {prediction.yesOdds}%
              </button>
              <button
                className="flex-1 font-semibold"
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontSize: "11px",
                  background: "rgba(255, 71, 87, 0.2)",
                  color: "#ff4757",
                  border: "none",
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

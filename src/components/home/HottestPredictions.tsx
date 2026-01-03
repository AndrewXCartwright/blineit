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
    <div className="mb-4">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-foreground">
          🎯 Hottest Predictions
        </span>
        <button
          onClick={() => navigate("/predict")}
          className="bg-transparent border-none text-[11px] text-bull cursor-pointer"
        >
          See All →
        </button>
      </div>

      {/* Scroll Container */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
        {predictions.map((prediction, index) => (
          <div
            key={index}
            className="min-w-[200px] flex-shrink-0 bg-card border border-border rounded-xl p-3.5"
          >
            {/* Question */}
            <p className="text-[11px] text-foreground leading-relaxed">
              {prediction.question}
            </p>

            {/* Odds Row */}
            <div className="flex gap-2 mt-2.5">
              <button className="flex-1 py-2 px-2 rounded-md text-center text-[11px] font-semibold bg-bull/20 text-bull border-none cursor-pointer">
                YES {prediction.yesOdds}%
              </button>
              <button className="flex-1 py-2 px-2 rounded-md text-center text-[11px] font-semibold bg-bear/20 text-bear border-none cursor-pointer">
                NO {prediction.noOdds}%
              </button>
            </div>

            {/* Volume */}
            <p className="text-[9px] text-muted-foreground mt-2">
              Volume: {prediction.volume}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HottestPredictions;

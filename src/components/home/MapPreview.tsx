import { useNavigate } from "react-router-dom";
const mapDots = [{
  top: "30%",
  left: "25%"
}, {
  top: "50%",
  left: "60%"
}, {
  top: "70%",
  left: "40%"
}, {
  top: "25%",
  left: "75%"
}];
const MapPreview = () => {
  const navigate = useNavigate();
  return <div className="mb-4">
      {/* Section Header */}
      <div className="mb-3">
        <span className="font-semibold text-foreground text-base">
          📍 Near You
        </span>
      </div>

      {/* Map Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Map Preview Area */}
        <div className="h-[120px] bg-gradient-to-br from-blue-100 to-blue-50 dark:from-secondary dark:to-background relative">
          {/* Property Dots */}
          {mapDots.map((dot, index) => <div key={index} className="absolute w-2.5 h-2.5 bg-bull rounded-full animate-pulse glow-bull" style={{
          top: dot.top,
          left: dot.left
        }} />)}
        </div>

        {/* CTA Section */}
        <div className="p-3 flex justify-between items-center">
          {/* Left side */}
          <div>
            <p className="text-xs font-semibold text-foreground">
              Invest in Your Neighborhood
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              7 properties within 25 miles
            </p>
          </div>

          {/* Right side - EXPLORE button */}
          <button onClick={() => navigate("/explore")} className="bg-bull text-bull-foreground py-2 px-3.5 rounded-full text-[10px] font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity">
            EXPLORE
          </button>
        </div>
      </div>
    </div>;
};
export default MapPreview;
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortfolioValueChart } from '@/components/analytics/PortfolioValueChart';
import { PerformanceCards } from '@/components/analytics/PerformanceCards';
import { AllocationChart } from '@/components/analytics/AllocationChart';
import { IncomeChart } from '@/components/analytics/IncomeChart';
import { HoldingsTable } from '@/components/analytics/HoldingsTable';
import { PredictionAnalytics } from '@/components/analytics/PredictionAnalytics';
import { BottomNav } from '@/components/BottomNav';

const PortfolioAnalytics = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/assets">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Portfolio Analytics</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Portfolio Value Chart */}
        <PortfolioValueChart />
        
        {/* Performance Summary Cards */}
        <PerformanceCards />
        
        {/* Allocation and Income - Side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AllocationChart />
          <IncomeChart />
        </div>
        
        {/* Holdings Table */}
        <HoldingsTable />
        
        {/* Prediction Analytics */}
        <PredictionAnalytics />
      </div>

      <BottomNav />
    </div>
  );
};

export default PortfolioAnalytics;

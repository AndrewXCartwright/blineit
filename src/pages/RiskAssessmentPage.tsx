import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { RiskAssessment } from '@/components/RiskAssessment';
import { Shield } from 'lucide-react';

const RiskAssessmentPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Risk Assessment</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered portfolio risk analysis
            </p>
          </div>
        </div>

        <RiskAssessment />
      </main>

      <BottomNav />
    </div>
  );
};

export default RiskAssessmentPage;

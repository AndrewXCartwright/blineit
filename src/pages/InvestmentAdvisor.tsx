import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { InvestmentAdvisorChat } from "@/components/InvestmentAdvisorChat";

export default function InvestmentAdvisor() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main id="main-content" className="flex-1 flex flex-col pb-20 md:pb-6">
        <div className="flex-1 max-w-3xl w-full mx-auto flex flex-col">
          <InvestmentAdvisorChat />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

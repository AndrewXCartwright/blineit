import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { NetworkStatus } from "@/components/NetworkStatus";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import Index from "./pages/Index";
import Assets from "./pages/Assets";
import AssetsExplore from "./pages/AssetsExplore";
import Predict from "./pages/Predict";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import PropertyDetail from "./pages/PropertyDetail";
import LoanDetail from "./pages/LoanDetail";
import KYCVerification from "./pages/KYCVerification";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import Referrals from "./pages/Referrals";
import ReferralLanding from "./pages/ReferralLanding";
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/NotificationSettings";
import Community from "./pages/Community";
import UserProfile from "./pages/UserProfile";
import Leaderboard from "./pages/Leaderboard";
import PortfolioAnalytics from "./pages/PortfolioAnalytics";
import InstallPage from "./pages/InstallPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminLoans from "./pages/admin/AdminLoans";
import AdminPredictions from "./pages/admin/AdminPredictions";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminWaitlists from "./pages/admin/AdminWaitlists";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminKYC from "./pages/admin/AdminKYC";
import AdminReferrals from "./pages/admin/AdminReferrals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <NetworkStatus />
          <PWAInstallPrompt />
          <UpdatePrompt />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
              <Route path="/assets/explore" element={<ProtectedRoute><AssetsExplore /></ProtectedRoute>} />
              <Route path="/predict" element={<ProtectedRoute><Predict /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/property/:id" element={<ProtectedRoute><PropertyDetail /></ProtectedRoute>} />
              <Route path="/loan/:id" element={<ProtectedRoute><LoanDetail /></ProtectedRoute>} />
              <Route path="/kyc" element={<ProtectedRoute><KYCVerification /></ProtectedRoute>} />
              <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
              <Route path="/user/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/portfolio/analytics" element={<ProtectedRoute><PortfolioAnalytics /></ProtectedRoute>} />
              <Route path="/r/:code" element={<ReferralLanding />} />
              <Route path="/install" element={<InstallPage />} />
              <Route path="/coming-soon/:assetClass" element={<ComingSoon />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/properties" element={<ProtectedRoute><AdminProperties /></ProtectedRoute>} />
              <Route path="/admin/loans" element={<ProtectedRoute><AdminLoans /></ProtectedRoute>} />
              <Route path="/admin/predictions" element={<ProtectedRoute><AdminPredictions /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/kyc" element={<ProtectedRoute><AdminKYC /></ProtectedRoute>} />
              <Route path="/admin/referrals" element={<ProtectedRoute><AdminReferrals /></ProtectedRoute>} />
              <Route path="/admin/waitlists" element={<ProtectedRoute><AdminWaitlists /></ProtectedRoute>} />
              <Route path="/admin/transactions" element={<ProtectedRoute><AdminTransactions /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

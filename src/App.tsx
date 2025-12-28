import * as React from "react";
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
import { ComparisonProvider } from "@/hooks/useComparison";
import { ComparisonTray } from "@/components/comparison/ComparisonTray";
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
import SecuritySettings from "./pages/SecuritySettings";
import Documents from "./pages/Documents";
import Search from "./pages/Search";
import CompareProperties from "./pages/CompareProperties";
import CompareLoans from "./pages/CompareLoans";
import ComparePredictions from "./pages/ComparePredictions";
import Calculators from "./pages/Calculators";
import EquityCalculator from "./pages/EquityCalculator";
import DebtCalculator from "./pages/DebtCalculator";
import PredictionCalculator from "./pages/PredictionCalculator";
import PortfolioCalculator from "./pages/PortfolioCalculator";
import CompoundCalculator from "./pages/CompoundCalculator";
import DRIPSettings from "./pages/DRIPSettings";
import DRIPDashboard from "./pages/DRIPDashboard";
import DRIPHistory from "./pages/DRIPHistory";
import AutoInvest from "./pages/AutoInvest";
import AutoInvestCreate from "./pages/AutoInvestCreate";
import AutoInvestDetail from "./pages/AutoInvestDetail";
import Watchlist from "./pages/Watchlist";
import WatchlistLists from "./pages/WatchlistLists";
import WatchlistDetail from "./pages/WatchlistDetail";
import PriceAlerts from "./pages/Alerts";
import AlertSettings from "./pages/AlertSettings";
import SecondaryMarketHub from "./pages/SecondaryMarketHub";
import AllMarkets from "./pages/AllMarkets";
import MyOrders from "./pages/MyOrders";
import TradeHistory from "./pages/TradeHistory";
import TokenMarket from "./pages/TokenMarket";
import TaxCenter from "./pages/TaxCenter";
import TaxSummary from "./pages/TaxSummary";
import TaxDividends from "./pages/TaxDividends";
import TaxInterest from "./pages/TaxInterest";
import TaxCapitalGains from "./pages/TaxCapitalGains";
import TaxPredictions from "./pages/TaxPredictions";
import TaxSettings from "./pages/TaxSettings";
import TaxCostBasis from "./pages/TaxCostBasis";
import DeveloperPortal from "./pages/DeveloperPortal";
import DeveloperApiKeys from "./pages/DeveloperApiKeys";
import DeveloperApiKeyCreate from "./pages/DeveloperApiKeyCreate";
import DeveloperApiKeyDetail from "./pages/DeveloperApiKeyDetail";
import DeveloperWebhooks from "./pages/DeveloperWebhooks";
import DeveloperWebhookCreate from "./pages/DeveloperWebhookCreate";
import DeveloperWebhookDetail from "./pages/DeveloperWebhookDetail";
import DeveloperDocs from "./pages/DeveloperDocs";
import DeveloperEndpointDoc from "./pages/DeveloperEndpointDoc";
import DeveloperUsage from "./pages/DeveloperUsage";
import DeveloperSandbox from "./pages/DeveloperSandbox";
import DeveloperPlans from "./pages/DeveloperPlans";
import DeveloperSdks from "./pages/DeveloperSdks";
import DeveloperChangelog from "./pages/DeveloperChangelog";
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
import Accreditation from "./pages/Accreditation";
import AccreditationStatus from "./pages/AccreditationStatus";
import ExclusiveOfferings from "./pages/ExclusiveOfferings";
import InstitutionalDashboard from "./pages/InstitutionalDashboard";
import InstitutionalOfferingDetail from "./pages/InstitutionalOfferingDetail";
import InstitutionalSubscriptionFlow from "./pages/InstitutionalSubscriptionFlow";
import InstitutionalInvestments from "./pages/InstitutionalInvestments";
import InstitutionalInvestmentDetail from "./pages/InstitutionalInvestmentDetail";
import InstitutionalReports from "./pages/InstitutionalReports";
import InstitutionalEntitySetup from "./pages/InstitutionalEntitySetup";
import InstitutionalContact from "./pages/InstitutionalContact";
import GovernanceHub from "./pages/GovernanceHub";
import ProposalDetail from "./pages/ProposalDetail";
import MyGovernance from "./pages/MyGovernance";
import Delegations from "./pages/Delegations";
import BiometricSetup from "./pages/BiometricSetup";
import PinSetup from "./pages/PinSetup";
import TrustedDevices from "./pages/TrustedDevices";
import SecurityActivity from "./pages/SecurityActivity";
import ReportsHub from "./pages/ReportsHub";
import ReportBuilder from "./pages/ReportBuilder";
import ScheduledReports from "./pages/ScheduledReports";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ComparisonTool from "./pages/ComparisonTool";
import DataExport from "./pages/DataExport";
import ReportView from "./pages/ReportView";
import NewsFeed from "./pages/NewsFeed";
import UpdateDetail from "./pages/UpdateDetail";
import Announcements from "./pages/Announcements";
import MarketNews from "./pages/MarketNews";
import NewsArticle from "./pages/NewsArticle";
import FeedPreferences from "./pages/FeedPreferences";
import HelpCenter from "./pages/HelpCenter";
import FAQCategory from "./pages/FAQCategory";
import FAQArticle from "./pages/FAQArticle";
import ContactSupport from "./pages/ContactSupport";
import NewTicket from "./pages/NewTicket";
import MyTickets from "./pages/MyTickets";
import TicketDetail from "./pages/TicketDetail";
import LiveChat from "./pages/LiveChat";
import AchievementsHub from "./pages/AchievementsHub";
import XPHistory from "./pages/XPHistory";
import Challenges from "./pages/Challenges";
import Leaderboards from "./pages/Leaderboards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <ComparisonProvider>
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
                <Route path="/settings/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
                <Route path="/settings/security/biometric" element={<ProtectedRoute><BiometricSetup /></ProtectedRoute>} />
                <Route path="/settings/security/pin" element={<ProtectedRoute><PinSetup /></ProtectedRoute>} />
                <Route path="/settings/security/devices" element={<ProtectedRoute><TrustedDevices /></ProtectedRoute>} />
                <Route path="/settings/security/activity" element={<ProtectedRoute><SecurityActivity /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                <Route path="/user/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/portfolio/analytics" element={<ProtectedRoute><PortfolioAnalytics /></ProtectedRoute>} />
                <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <Route path="/compare/properties" element={<ProtectedRoute><CompareProperties /></ProtectedRoute>} />
                <Route path="/compare/loans" element={<ProtectedRoute><CompareLoans /></ProtectedRoute>} />
                <Route path="/compare/predictions" element={<ProtectedRoute><ComparePredictions /></ProtectedRoute>} />
                <Route path="/calculators" element={<ProtectedRoute><Calculators /></ProtectedRoute>} />
                <Route path="/calculators/equity" element={<ProtectedRoute><EquityCalculator /></ProtectedRoute>} />
                <Route path="/calculators/debt" element={<ProtectedRoute><DebtCalculator /></ProtectedRoute>} />
                <Route path="/calculators/prediction" element={<ProtectedRoute><PredictionCalculator /></ProtectedRoute>} />
                <Route path="/calculators/portfolio" element={<ProtectedRoute><PortfolioCalculator /></ProtectedRoute>} />
                <Route path="/calculators/compound" element={<ProtectedRoute><CompoundCalculator /></ProtectedRoute>} />
                <Route path="/settings/drip" element={<ProtectedRoute><DRIPSettings /></ProtectedRoute>} />
                <Route path="/drip" element={<ProtectedRoute><DRIPDashboard /></ProtectedRoute>} />
                <Route path="/drip/history" element={<ProtectedRoute><DRIPHistory /></ProtectedRoute>} />
                <Route path="/auto-invest" element={<ProtectedRoute><AutoInvest /></ProtectedRoute>} />
                <Route path="/auto-invest/create" element={<ProtectedRoute><AutoInvestCreate /></ProtectedRoute>} />
                <Route path="/auto-invest/:id" element={<ProtectedRoute><AutoInvestDetail /></ProtectedRoute>} />
                <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
                <Route path="/watchlist/lists" element={<ProtectedRoute><WatchlistLists /></ProtectedRoute>} />
                <Route path="/watchlist/:id" element={<ProtectedRoute><WatchlistDetail /></ProtectedRoute>} />
                <Route path="/alerts" element={<ProtectedRoute><PriceAlerts /></ProtectedRoute>} />
                <Route path="/settings/alerts" element={<ProtectedRoute><AlertSettings /></ProtectedRoute>} />
                {/* Secondary Market Routes */}
                <Route path="/market" element={<ProtectedRoute><SecondaryMarketHub /></ProtectedRoute>} />
                <Route path="/market/all" element={<ProtectedRoute><AllMarkets /></ProtectedRoute>} />
                <Route path="/market/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/market/history" element={<ProtectedRoute><TradeHistory /></ProtectedRoute>} />
                <Route path="/market/:itemId" element={<ProtectedRoute><TokenMarket /></ProtectedRoute>} />
                {/* Tax Center Routes */}
                <Route path="/tax" element={<ProtectedRoute><TaxCenter /></ProtectedRoute>} />
                <Route path="/tax/summary" element={<ProtectedRoute><TaxSummary /></ProtectedRoute>} />
                <Route path="/tax/dividends" element={<ProtectedRoute><TaxDividends /></ProtectedRoute>} />
                <Route path="/tax/interest" element={<ProtectedRoute><TaxInterest /></ProtectedRoute>} />
                <Route path="/tax/capital-gains" element={<ProtectedRoute><TaxCapitalGains /></ProtectedRoute>} />
                <Route path="/tax/predictions" element={<ProtectedRoute><TaxPredictions /></ProtectedRoute>} />
                <Route path="/tax/settings" element={<ProtectedRoute><TaxSettings /></ProtectedRoute>} />
                <Route path="/tax/cost-basis" element={<ProtectedRoute><TaxCostBasis /></ProtectedRoute>} />
                <Route path="/r/:code" element={<ReferralLanding />} />
                <Route path="/install" element={<InstallPage />} />
                {/* Accredited Investor Routes */}
                <Route path="/accreditation" element={<ProtectedRoute><Accreditation /></ProtectedRoute>} />
                <Route path="/accreditation/status" element={<ProtectedRoute><AccreditationStatus /></ProtectedRoute>} />
                <Route path="/exclusive-offerings" element={<ProtectedRoute><ExclusiveOfferings /></ProtectedRoute>} />
                {/* Institutional Investor Routes */}
                <Route path="/institutional" element={<ProtectedRoute><InstitutionalDashboard /></ProtectedRoute>} />
                <Route path="/institutional/offerings" element={<ProtectedRoute><ExclusiveOfferings /></ProtectedRoute>} />
                <Route path="/institutional/offering/:id" element={<ProtectedRoute><InstitutionalOfferingDetail /></ProtectedRoute>} />
                <Route path="/institutional/subscribe/:id" element={<ProtectedRoute><InstitutionalSubscriptionFlow /></ProtectedRoute>} />
                <Route path="/institutional/investments" element={<ProtectedRoute><InstitutionalInvestments /></ProtectedRoute>} />
                <Route path="/institutional/investment/:id" element={<ProtectedRoute><InstitutionalInvestmentDetail /></ProtectedRoute>} />
                <Route path="/institutional/reports" element={<ProtectedRoute><InstitutionalReports /></ProtectedRoute>} />
                <Route path="/institutional/entity" element={<ProtectedRoute><InstitutionalEntitySetup /></ProtectedRoute>} />
                <Route path="/institutional/contact" element={<ProtectedRoute><InstitutionalContact /></ProtectedRoute>} />
                <Route path="/coming-soon/:assetClass" element={<ComingSoon />} />
                {/* Reports Routes */}
                <Route path="/reports" element={<ProtectedRoute><ReportsHub /></ProtectedRoute>} />
                <Route path="/reports/builder" element={<ProtectedRoute><ReportBuilder /></ProtectedRoute>} />
                <Route path="/reports/scheduled" element={<ProtectedRoute><ScheduledReports /></ProtectedRoute>} />
                <Route path="/reports/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                <Route path="/reports/compare" element={<ProtectedRoute><ComparisonTool /></ProtectedRoute>} />
                <Route path="/reports/export" element={<ProtectedRoute><DataExport /></ProtectedRoute>} />
                <Route path="/reports/view/:id" element={<ProtectedRoute><ReportView /></ProtectedRoute>} />
                {/* News Feed Routes */}
                <Route path="/feed" element={<ProtectedRoute><NewsFeed /></ProtectedRoute>} />
                <Route path="/feed/update/:id" element={<ProtectedRoute><UpdateDetail /></ProtectedRoute>} />
                <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
                <Route path="/news" element={<ProtectedRoute><MarketNews /></ProtectedRoute>} />
                <Route path="/news/:id" element={<ProtectedRoute><NewsArticle /></ProtectedRoute>} />
                <Route path="/settings/feed" element={<ProtectedRoute><FeedPreferences /></ProtectedRoute>} />
                {/* Governance Routes */}
                <Route path="/governance" element={<ProtectedRoute><GovernanceHub /></ProtectedRoute>} />
                <Route path="/governance/proposal/:id" element={<ProtectedRoute><ProposalDetail /></ProtectedRoute>} />
                <Route path="/governance/my-votes" element={<ProtectedRoute><MyGovernance /></ProtectedRoute>} />
                <Route path="/governance/delegations" element={<ProtectedRoute><Delegations /></ProtectedRoute>} />
                {/* Help Center Routes */}
                <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
                <Route path="/help/category/:slug" element={<ProtectedRoute><FAQCategory /></ProtectedRoute>} />
                <Route path="/help/article/:id" element={<ProtectedRoute><FAQArticle /></ProtectedRoute>} />
                <Route path="/help/contact" element={<ProtectedRoute><ContactSupport /></ProtectedRoute>} />
                <Route path="/help/ticket/new" element={<ProtectedRoute><NewTicket /></ProtectedRoute>} />
                <Route path="/help/tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
                <Route path="/help/ticket/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
                <Route path="/help/chat" element={<ProtectedRoute><LiveChat /></ProtectedRoute>} />
                {/* Developer Portal Routes */}
                <Route path="/developers" element={<ProtectedRoute><DeveloperPortal /></ProtectedRoute>} />
                <Route path="/developers/keys/create" element={<ProtectedRoute><DeveloperApiKeyCreate /></ProtectedRoute>} />
                <Route path="/developers/keys/:id" element={<ProtectedRoute><DeveloperApiKeyDetail /></ProtectedRoute>} />
                <Route path="/developers/webhooks" element={<ProtectedRoute><DeveloperWebhooks /></ProtectedRoute>} />
                <Route path="/developers/webhooks/create" element={<ProtectedRoute><DeveloperWebhookCreate /></ProtectedRoute>} />
                <Route path="/developers/webhooks/:id" element={<ProtectedRoute><DeveloperWebhookDetail /></ProtectedRoute>} />
                <Route path="/developers/docs" element={<ProtectedRoute><DeveloperDocs /></ProtectedRoute>} />
                <Route path="/developers/docs/:endpoint" element={<ProtectedRoute><DeveloperEndpointDoc /></ProtectedRoute>} />
                <Route path="/developers/usage" element={<ProtectedRoute><DeveloperUsage /></ProtectedRoute>} />
                <Route path="/developers/sandbox" element={<ProtectedRoute><DeveloperSandbox /></ProtectedRoute>} />
                <Route path="/developers/plans" element={<ProtectedRoute><DeveloperPlans /></ProtectedRoute>} />
                <Route path="/developers/sdks" element={<ProtectedRoute><DeveloperSdks /></ProtectedRoute>} />
                <Route path="/developers/changelog" element={<ProtectedRoute><DeveloperChangelog /></ProtectedRoute>} />
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
              <ComparisonTray />
              <BottomNav />
            </BrowserRouter>
          </ComparisonProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

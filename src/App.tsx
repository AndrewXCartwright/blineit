import * as React from "react";
import { Suspense, lazy } from "react";
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
import ErrorBoundary from "@/components/ErrorBoundary";
import SkipLink from "@/components/SkipLink";
import { Skeleton } from "@/components/ui/skeleton";

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="w-full max-w-md space-y-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <div className="space-y-3 pt-8">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

// Lazy load all pages for better initial load performance
const Index = lazy(() => import("./pages/Index"));
const Assets = lazy(() => import("./pages/Assets"));
const AssetsExplore = lazy(() => import("./pages/AssetsExplore"));
const Predict = lazy(() => import("./pages/Predict"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Profile = lazy(() => import("./pages/Profile"));
const Auth = lazy(() => import("./pages/Auth"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const LoanDetail = lazy(() => import("./pages/LoanDetail"));
const KYCVerification = lazy(() => import("./pages/KYCVerification"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Referrals = lazy(() => import("./pages/Referrals"));
const ReferralLanding = lazy(() => import("./pages/ReferralLanding"));
const NotificationCenter = lazy(() => import("./pages/NotificationCenter"));
const ArchivedNotifications = lazy(() => import("./pages/ArchivedNotifications"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const RegisteredDevices = lazy(() => import("./pages/RegisteredDevices"));
const Community = lazy(() => import("./pages/Community"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const PortfolioAnalytics = lazy(() => import("./pages/PortfolioAnalytics"));
const InstallPage = lazy(() => import("./pages/InstallPage"));
const SecuritySettings = lazy(() => import("./pages/SecuritySettings"));
const Documents = lazy(() => import("./pages/Documents"));
const Search = lazy(() => import("./pages/Search"));
const AdvancedSearch = lazy(() => import("./pages/AdvancedSearch"));
const SavedSearches = lazy(() => import("./pages/SavedSearches"));
const BrowseHistory = lazy(() => import("./pages/BrowseHistory"));
const Discover = lazy(() => import("./pages/Discover"));
const Trending = lazy(() => import("./pages/Trending"));
const CategoryBrowse = lazy(() => import("./pages/CategoryBrowse"));
const LocationBrowse = lazy(() => import("./pages/LocationBrowse"));
const PropertiesListing = lazy(() => import("./pages/PropertiesListing"));
const CompareProperties = lazy(() => import("./pages/CompareProperties"));
const CompareLoans = lazy(() => import("./pages/CompareLoans"));
const ComparePredictions = lazy(() => import("./pages/ComparePredictions"));
const Calculators = lazy(() => import("./pages/Calculators"));
const EquityCalculator = lazy(() => import("./pages/EquityCalculator"));
const DebtCalculator = lazy(() => import("./pages/DebtCalculator"));
const PredictionCalculator = lazy(() => import("./pages/PredictionCalculator"));
const PortfolioCalculator = lazy(() => import("./pages/PortfolioCalculator"));
const CompoundCalculator = lazy(() => import("./pages/CompoundCalculator"));
const DRIPSettings = lazy(() => import("./pages/DRIPSettings"));
const DRIPDashboard = lazy(() => import("./pages/DRIPDashboard"));
const DRIPHistory = lazy(() => import("./pages/DRIPHistory"));
const AutoInvest = lazy(() => import("./pages/AutoInvest"));
const AutoInvestCreate = lazy(() => import("./pages/AutoInvestCreate"));
const AutoInvestDetail = lazy(() => import("./pages/AutoInvestDetail"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const WatchlistLists = lazy(() => import("./pages/WatchlistLists"));
const WatchlistDetail = lazy(() => import("./pages/WatchlistDetail"));
const PriceAlerts = lazy(() => import("./pages/Alerts"));
const AlertSettings = lazy(() => import("./pages/AlertSettings"));
const SecondaryMarketHub = lazy(() => import("./pages/SecondaryMarketHub"));
const AllMarkets = lazy(() => import("./pages/AllMarkets"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const TradeHistory = lazy(() => import("./pages/TradeHistory"));
const TokenMarket = lazy(() => import("./pages/TokenMarket"));
const TaxCenter = lazy(() => import("./pages/TaxCenter"));
const TaxSummary = lazy(() => import("./pages/TaxSummary"));
const TaxDividends = lazy(() => import("./pages/TaxDividends"));
const TaxInterest = lazy(() => import("./pages/TaxInterest"));
const TaxCapitalGains = lazy(() => import("./pages/TaxCapitalGains"));
const TaxPredictions = lazy(() => import("./pages/TaxPredictions"));
const TaxSettings = lazy(() => import("./pages/TaxSettings"));
const TaxCostBasis = lazy(() => import("./pages/TaxCostBasis"));
const DeveloperPortal = lazy(() => import("./pages/DeveloperPortal"));
const DeveloperApiKeys = lazy(() => import("./pages/DeveloperApiKeys"));
const DeveloperApiKeyCreate = lazy(() => import("./pages/DeveloperApiKeyCreate"));
const DeveloperApiKeyDetail = lazy(() => import("./pages/DeveloperApiKeyDetail"));
const DeveloperWebhooks = lazy(() => import("./pages/DeveloperWebhooks"));
const DeveloperWebhookCreate = lazy(() => import("./pages/DeveloperWebhookCreate"));
const DeveloperWebhookDetail = lazy(() => import("./pages/DeveloperWebhookDetail"));
const DeveloperDocs = lazy(() => import("./pages/DeveloperDocs"));
const DeveloperEndpointDoc = lazy(() => import("./pages/DeveloperEndpointDoc"));
const DeveloperUsage = lazy(() => import("./pages/DeveloperUsage"));
const DeveloperSandbox = lazy(() => import("./pages/DeveloperSandbox"));
const DeveloperPlans = lazy(() => import("./pages/DeveloperPlans"));
const DeveloperSdks = lazy(() => import("./pages/DeveloperSdks"));
const DeveloperChangelog = lazy(() => import("./pages/DeveloperChangelog"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));
const AdminLoans = lazy(() => import("./pages/admin/AdminLoans"));
const AdminPredictions = lazy(() => import("./pages/admin/AdminPredictions"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminWaitlists = lazy(() => import("./pages/admin/AdminWaitlists"));
const AdminTransactions = lazy(() => import("./pages/admin/AdminTransactions"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminKYC = lazy(() => import("./pages/admin/AdminKYC"));
const AdminReferrals = lazy(() => import("./pages/admin/AdminReferrals"));
const Accreditation = lazy(() => import("./pages/Accreditation"));
const AccreditationStatus = lazy(() => import("./pages/AccreditationStatus"));
const ExclusiveOfferings = lazy(() => import("./pages/ExclusiveOfferings"));
const InstitutionalDashboard = lazy(() => import("./pages/InstitutionalDashboard"));
const InstitutionalOfferingDetail = lazy(() => import("./pages/InstitutionalOfferingDetail"));
const InstitutionalSubscriptionFlow = lazy(() => import("./pages/InstitutionalSubscriptionFlow"));
const InstitutionalInvestments = lazy(() => import("./pages/InstitutionalInvestments"));
const InstitutionalInvestmentDetail = lazy(() => import("./pages/InstitutionalInvestmentDetail"));
const InstitutionalReports = lazy(() => import("./pages/InstitutionalReports"));
const InstitutionalEntitySetup = lazy(() => import("./pages/InstitutionalEntitySetup"));
const InstitutionalContact = lazy(() => import("./pages/InstitutionalContact"));
const GovernanceHub = lazy(() => import("./pages/GovernanceHub"));
const ProposalDetail = lazy(() => import("./pages/ProposalDetail"));
const MyGovernance = lazy(() => import("./pages/MyGovernance"));
const Delegations = lazy(() => import("./pages/Delegations"));
const BiometricSetup = lazy(() => import("./pages/BiometricSetup"));
const PinSetup = lazy(() => import("./pages/PinSetup"));
const TrustedDevices = lazy(() => import("./pages/TrustedDevices"));
const SecurityActivity = lazy(() => import("./pages/SecurityActivity"));
const ReportsHub = lazy(() => import("./pages/ReportsHub"));
const ReportBuilder = lazy(() => import("./pages/ReportBuilder"));
const ScheduledReports = lazy(() => import("./pages/ScheduledReports"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const ComparisonTool = lazy(() => import("./pages/ComparisonTool"));
const DataExport = lazy(() => import("./pages/DataExport"));
const ReportView = lazy(() => import("./pages/ReportView"));
const NewsFeed = lazy(() => import("./pages/NewsFeed"));
const UpdateDetail = lazy(() => import("./pages/UpdateDetail"));
const Announcements = lazy(() => import("./pages/Announcements"));
const MarketNews = lazy(() => import("./pages/MarketNews"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const FeedPreferences = lazy(() => import("./pages/FeedPreferences"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const FAQCategory = lazy(() => import("./pages/FAQCategory"));
const FAQArticle = lazy(() => import("./pages/FAQArticle"));
const ContactSupport = lazy(() => import("./pages/ContactSupport"));
const NewTicket = lazy(() => import("./pages/NewTicket"));
const MyTickets = lazy(() => import("./pages/MyTickets"));
const TicketDetail = lazy(() => import("./pages/TicketDetail"));
const LiveChat = lazy(() => import("./pages/LiveChat"));
const AchievementsHub = lazy(() => import("./pages/AchievementsHub"));
const XPHistory = lazy(() => import("./pages/XPHistory"));
const Challenges = lazy(() => import("./pages/Challenges"));
const Leaderboards = lazy(() => import("./pages/Leaderboards"));
const LaunchChecklist = lazy(() => import("./pages/admin/LaunchChecklist"));
const InvestmentAdvisor = lazy(() => import("./pages/InvestmentAdvisor"));
const MarketInsightsPage = lazy(() => import("./pages/MarketInsightsPage"));
const RiskAssessmentPage = lazy(() => import("./pages/RiskAssessmentPage"));
const Messages = lazy(() => import("./pages/Messages"));
const Conversation = lazy(() => import("./pages/Conversation"));
const MessagesHub = lazy(() => import("./pages/MessagesHub"));
const GroupChatView = lazy(() => import("./pages/GroupChatView"));
const DirectMessageView = lazy(() => import("./pages/DirectMessageView"));
const GroupSettings = lazy(() => import("./pages/GroupSettings"));
const GroupMembers = lazy(() => import("./pages/GroupMembers"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
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
              <SkipLink />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
                  <Route path="/assets/explore" element={<ProtectedRoute><AssetsExplore /></ProtectedRoute>} />
                  <Route path="/properties" element={<ProtectedRoute><PropertiesListing /></ProtectedRoute>} />
                  <Route path="/explore" element={<ProtectedRoute><PropertiesListing /></ProtectedRoute>} />
                  <Route path="/predict" element={<ProtectedRoute><Predict /></ProtectedRoute>} />
                  <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/property/:id" element={<ProtectedRoute><PropertyDetail /></ProtectedRoute>} />
                  <Route path="/loan/:id" element={<ProtectedRoute><LoanDetail /></ProtectedRoute>} />
                  <Route path="/kyc" element={<ProtectedRoute><KYCVerification /></ProtectedRoute>} />
                  <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
                  <Route path="/advisor" element={<ProtectedRoute><InvestmentAdvisor /></ProtectedRoute>} />
                  <Route path="/insights" element={<ProtectedRoute><MarketInsightsPage /></ProtectedRoute>} />
                  <Route path="/risk" element={<ProtectedRoute><RiskAssessmentPage /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
                  <Route path="/notifications/archived" element={<ProtectedRoute><ArchivedNotifications /></ProtectedRoute>} />
                  <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
                  <Route path="/settings/notifications/devices" element={<ProtectedRoute><RegisteredDevices /></ProtectedRoute>} />
                  <Route path="/settings/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
                  <Route path="/settings/security/biometric" element={<ProtectedRoute><BiometricSetup /></ProtectedRoute>} />
                  <Route path="/settings/security/pin" element={<ProtectedRoute><PinSetup /></ProtectedRoute>} />
                  <Route path="/settings/security/devices" element={<ProtectedRoute><TrustedDevices /></ProtectedRoute>} />
                  <Route path="/settings/security/activity" element={<ProtectedRoute><SecurityActivity /></ProtectedRoute>} />
                  <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                  <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
                  <Route path="/user/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><MessagesHub /></ProtectedRoute>} />
                  <Route path="/messages/dm/:conversationId" element={<ProtectedRoute><DirectMessageView /></ProtectedRoute>} />
                  <Route path="/messages/groups/:groupId" element={<ProtectedRoute><GroupChatView /></ProtectedRoute>} />
                  <Route path="/messages/groups/:groupId/settings" element={<ProtectedRoute><GroupSettings /></ProtectedRoute>} />
                  <Route path="/messages/groups/:groupId/members" element={<ProtectedRoute><GroupMembers /></ProtectedRoute>} />
                  <Route path="/messages/:id" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
                  <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                  <Route path="/portfolio/analytics" element={<ProtectedRoute><PortfolioAnalytics /></ProtectedRoute>} />
                  <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                  <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                  <Route path="/search/advanced" element={<ProtectedRoute><AdvancedSearch /></ProtectedRoute>} />
                  <Route path="/search/saved" element={<ProtectedRoute><SavedSearches /></ProtectedRoute>} />
                  <Route path="/search/history" element={<ProtectedRoute><BrowseHistory /></ProtectedRoute>} />
                  <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
                  <Route path="/discover/trending" element={<ProtectedRoute><Trending /></ProtectedRoute>} />
                  <Route path="/discover/category/:slug" element={<ProtectedRoute><CategoryBrowse /></ProtectedRoute>} />
                  <Route path="/discover/location/:slug" element={<ProtectedRoute><LocationBrowse /></ProtectedRoute>} />
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
                  {/* Achievements & Gamification Routes */}
                  <Route path="/achievements" element={<ProtectedRoute><AchievementsHub /></ProtectedRoute>} />
                  <Route path="/achievements/history" element={<ProtectedRoute><XPHistory /></ProtectedRoute>} />
                  <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
                  <Route path="/leaderboards" element={<ProtectedRoute><Leaderboards /></ProtectedRoute>} />
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
                  <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
                  <Route path="/admin/launch-checklist" element={<ProtectedRoute><LaunchChecklist /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <ComparisonTray />
              <BottomNav />
            </BrowserRouter>
          </ComparisonProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

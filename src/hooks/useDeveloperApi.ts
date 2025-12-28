import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  environment: "sandbox" | "production";
  rate_limit_tier: string;
  requests_today: number;
  requests_this_month: number;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  ip_whitelist: string[];
  created_at: string;
  updated_at: string;
}

export interface ApiWebhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: "pending" | "delivered" | "failed";
  status_code: number | null;
  response_body: string | null;
  attempts: number;
  next_retry_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface ApiRequestLog {
  id: string;
  api_key_id: string;
  user_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  ip_address: string | null;
  created_at: string;
}

export interface ApiUsageStats {
  requestsToday: number;
  requestsThisMonth: number;
  dailyLimit: number;
  successRate: number;
  avgLatency: number;
  activeKeys: number;
  activeWebhooks: number;
}

const generateApiKey = (environment: "sandbox" | "production"): string => {
  const prefix = environment === "production" ? "blit_prod_sk_" : "blit_sandbox_sk_";
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return prefix + randomBytes;
};

const hashApiKey = async (key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

const generateWebhookSecret = (): string => {
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return "whsec_" + randomBytes;
};

export const useApiKeys = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["api-keys", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((key) => ({
        ...key,
        permissions: Array.isArray(key.permissions) ? key.permissions : [],
        ip_whitelist: Array.isArray(key.ip_whitelist) ? key.ip_whitelist : [],
      })) as ApiKey[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      environment,
      permissions,
      expiresAt,
      ipWhitelist,
    }: {
      name: string;
      environment: "sandbox" | "production";
      permissions: string[];
      expiresAt?: string | null;
      ipWhitelist?: string[];
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const fullKey = generateApiKey(environment);
      const keyPrefix = fullKey.substring(0, 20) + "...";
      const keyHash = await hashApiKey(fullKey);

      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          user_id: user.id,
          name,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          permissions,
          environment,
          expires_at: expiresAt,
          ip_whitelist: ipWhitelist || [],
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, fullKey };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({ title: "API Key Created", description: "Your new API key is ready to use." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create API key.", variant: "destructive" });
    },
  });
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (keyId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("api_keys")
        .update({ is_active: false })
        .eq("id", keyId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({ title: "API Key Revoked", description: "The API key has been deactivated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to revoke API key.", variant: "destructive" });
    },
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (keyId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({ title: "API Key Deleted", description: "The API key has been permanently removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete API key.", variant: "destructive" });
    },
  });
};

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ApiKey> }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("api_keys")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({ title: "API Key Updated", description: "The API key has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update API key.", variant: "destructive" });
    },
  });
};

export const useWebhooks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["api-webhooks", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("api_webhooks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((webhook) => ({
        ...webhook,
        events: Array.isArray(webhook.events) ? webhook.events : [],
      })) as ApiWebhook[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateWebhook = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      url,
      events,
    }: {
      name: string;
      url: string;
      events: string[];
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const secret = generateWebhookSecret();

      const { data, error } = await supabase
        .from("api_webhooks")
        .insert({
          user_id: user.id,
          name,
          url,
          secret,
          events,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ApiWebhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-webhooks"] });
      toast({ title: "Webhook Created", description: "Your webhook is now active." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create webhook.", variant: "destructive" });
    },
  });
};

export const useUpdateWebhook = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ApiWebhook> }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("api_webhooks")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-webhooks"] });
      toast({ title: "Webhook Updated", description: "The webhook has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update webhook.", variant: "destructive" });
    },
  });
};

export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (webhookId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("api_webhooks")
        .delete()
        .eq("id", webhookId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-webhooks"] });
      toast({ title: "Webhook Deleted", description: "The webhook has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete webhook.", variant: "destructive" });
    },
  });
};

export const useWebhookDeliveries = (webhookId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["webhook-deliveries", webhookId],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("webhook_deliveries")
        .select("*")
        .eq("webhook_id", webhookId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as WebhookDelivery[];
    },
    enabled: !!user?.id && !!webhookId,
  });
};

export const useApiUsageStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["api-usage-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      // Get API keys
      const { data: keys } = await supabase
        .from("api_keys")
        .select("id, requests_today, requests_this_month, is_active, rate_limit_tier")
        .eq("user_id", user.id);

      // Get webhooks
      const { data: webhooks } = await supabase
        .from("api_webhooks")
        .select("id, is_active")
        .eq("user_id", user.id);

      // Get recent requests for stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentRequests } = await supabase
        .from("api_requests_log")
        .select("status_code, response_time_ms")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString());

      const activeKeys = keys?.filter((k) => k.is_active).length || 0;
      const activeWebhooks = webhooks?.filter((w) => w.is_active).length || 0;
      const requestsToday = keys?.reduce((sum, k) => sum + (k.requests_today || 0), 0) || 0;
      const requestsThisMonth = keys?.reduce((sum, k) => sum + (k.requests_this_month || 0), 0) || 0;

      // Calculate success rate and avg latency
      const successfulRequests = recentRequests?.filter((r) => r.status_code >= 200 && r.status_code < 400).length || 0;
      const totalRequests = recentRequests?.length || 0;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100;
      const avgLatency = totalRequests > 0
        ? (recentRequests?.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) || 0) / totalRequests
        : 0;

      // Determine daily limit based on tier
      const tier = keys?.[0]?.rate_limit_tier || "free";
      const dailyLimits: Record<string, number> = {
        free: 1000,
        basic: 10000,
        pro: 100000,
        enterprise: 1000000,
      };

      return {
        requestsToday,
        requestsThisMonth,
        dailyLimit: dailyLimits[tier] || 1000,
        successRate: Math.round(successRate * 10) / 10,
        avgLatency: Math.round(avgLatency),
        activeKeys,
        activeWebhooks,
      } as ApiUsageStats;
    },
    enabled: !!user?.id,
  });
};

export const useApiRequestLogs = (keyId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["api-request-logs", user?.id, keyId],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      let query = supabase
        .from("api_requests_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (keyId) {
        query = query.eq("api_key_id", keyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ApiRequestLog[];
    },
    enabled: !!user?.id,
  });
};

export const WEBHOOK_EVENTS = [
  { value: "dividend.paid", label: "Dividend Paid", category: "Portfolio" },
  { value: "interest.paid", label: "Interest Paid", category: "Portfolio" },
  { value: "investment.completed", label: "Investment Completed", category: "Portfolio" },
  { value: "trade.executed", label: "Trade Executed", category: "Market" },
  { value: "order.filled", label: "Order Filled", category: "Market" },
  { value: "order.cancelled", label: "Order Cancelled", category: "Market" },
  { value: "price_alert.triggered", label: "Price Alert Triggered", category: "Alerts" },
  { value: "prediction.resolved", label: "Prediction Resolved", category: "Alerts" },
  { value: "property.new", label: "New Property Listed", category: "Properties" },
  { value: "property.funded", label: "Property Funded", category: "Properties" },
  { value: "loan.new", label: "New Loan Available", category: "Properties" },
];

export const API_PERMISSIONS = [
  { value: "portfolio:read", label: "Read Portfolio", description: "View holdings, balances, and positions", category: "Portfolio" },
  { value: "transactions:read", label: "Read Transactions", description: "View transaction history", category: "Portfolio" },
  { value: "dividends:read", label: "Read Dividends", description: "View dividend history and projections", category: "Portfolio" },
  { value: "properties:read", label: "Read Properties", description: "View property listings and details", category: "Market Data" },
  { value: "loans:read", label: "Read Loans", description: "View loan listings and details", category: "Market Data" },
  { value: "predictions:read", label: "Read Predictions", description: "View prediction markets", category: "Market Data" },
  { value: "market:read", label: "Read Market", description: "View secondary market data and order books", category: "Market Data" },
  { value: "orders:write", label: "Write Orders", description: "Place buy/sell orders on secondary market", category: "Trading" },
  { value: "investments:write", label: "Write Investments", description: "Make primary market investments", category: "Trading" },
  { value: "predictions:write", label: "Write Predictions", description: "Place prediction market bets", category: "Trading" },
  { value: "transfers:write", label: "Write Transfers", description: "Initiate wallet transfers", category: "Account", highRisk: true },
  { value: "settings:write", label: "Write Settings", description: "Modify account settings", category: "Account" },
];
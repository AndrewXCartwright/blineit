import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { LiquidityRequest } from "@/types/liquidity";

interface NotificationData {
  request_id?: string;
  request_number?: string;
  investor_id?: string;
  investor_email?: string;
  investor_name?: string;
  offering_id?: string;
  property_name?: string;
  quantity?: number;
  gross_value?: number;
  fee_amount?: number;
  net_payout?: number;
  status?: string;
  denial_reason?: string;
  payout_reference?: string;
  reserve_balance?: number;
  reserve_target?: number;
  pending_requests_count?: number;
  admin_emails?: string[];
  sponsor_email?: string;
  monthly_redemptions?: number;
  monthly_amount?: number;
}

type NotificationType =
  | "request_submitted"
  | "request_approved"
  | "request_processing"
  | "request_completed"
  | "request_denied"
  | "admin_new_request"
  | "reserve_low_warning"
  | "sponsor_monthly_summary";

export function useLiquidityNotifications() {
  const sendNotification = async (
    type: NotificationType,
    data: NotificationData
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke("liquidity-notifications", {
        body: { type, data },
      });

      if (error) {
        console.error("Error sending notification:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Failed to send notification:", err);
      return false;
    }
  };

  // Helper to send investor notification on request submit
  const notifyRequestSubmitted = async (
    request: Partial<LiquidityRequest>,
    investorEmail: string,
    propertyName: string,
    investorName?: string
  ) => {
    return sendNotification("request_submitted", {
      request_id: request.id,
      request_number: request.request_number,
      investor_id: request.investor_id,
      investor_email: investorEmail,
      investor_name: investorName,
      offering_id: request.offering_id,
      property_name: propertyName,
      quantity: request.quantity,
      gross_value: request.gross_value,
      fee_amount: request.fee_amount,
      net_payout: request.net_payout,
      status: request.status,
    });
  };

  // Helper to notify admins of new request
  const notifyAdminNewRequest = async (
    request: Partial<LiquidityRequest>,
    investorEmail: string,
    investorName: string,
    propertyName: string,
    adminEmails: string[]
  ) => {
    return sendNotification("admin_new_request", {
      request_id: request.id,
      request_number: request.request_number,
      investor_id: request.investor_id,
      investor_email: investorEmail,
      investor_name: investorName,
      offering_id: request.offering_id,
      property_name: propertyName,
      quantity: request.quantity,
      gross_value: request.gross_value,
      fee_amount: request.fee_amount,
      net_payout: request.net_payout,
      admin_emails: adminEmails,
    });
  };

  // Helper to notify investor of approval
  const notifyRequestApproved = async (
    request: Partial<LiquidityRequest>,
    investorEmail: string
  ) => {
    return sendNotification("request_approved", {
      request_id: request.id,
      request_number: request.request_number,
      investor_id: request.investor_id,
      investor_email: investorEmail,
      net_payout: request.net_payout,
      status: "approved",
    });
  };

  // Helper to notify investor of processing
  const notifyRequestProcessing = async (
    request: Partial<LiquidityRequest>,
    investorEmail: string
  ) => {
    return sendNotification("request_processing", {
      request_id: request.id,
      request_number: request.request_number,
      investor_id: request.investor_id,
      investor_email: investorEmail,
      net_payout: request.net_payout,
      status: "processing",
    });
  };

  // Helper to notify investor of completion
  const notifyRequestCompleted = async (
    request: Partial<LiquidityRequest>,
    investorEmail: string,
    payoutReference?: string
  ) => {
    return sendNotification("request_completed", {
      request_id: request.id,
      request_number: request.request_number,
      investor_id: request.investor_id,
      investor_email: investorEmail,
      net_payout: request.net_payout,
      payout_reference: payoutReference,
      status: "completed",
    });
  };

  // Helper to notify investor of denial
  const notifyRequestDenied = async (
    request: Partial<LiquidityRequest>,
    investorEmail: string,
    denialReason: string
  ) => {
    return sendNotification("request_denied", {
      request_id: request.id,
      request_number: request.request_number,
      investor_id: request.investor_id,
      investor_email: investorEmail,
      denial_reason: denialReason,
      status: "denied",
    });
  };

  // Helper to warn about low reserve
  const notifyReserveLow = async (
    propertyName: string,
    offeringId: string,
    reserveBalance: number,
    reserveTarget: number,
    pendingRequestsCount: number,
    adminEmails: string[]
  ) => {
    return sendNotification("reserve_low_warning", {
      property_name: propertyName,
      offering_id: offeringId,
      reserve_balance: reserveBalance,
      reserve_target: reserveTarget,
      pending_requests_count: pendingRequestsCount,
      admin_emails: adminEmails,
    });
  };

  // Helper to send sponsor monthly summary
  const notifySponsorMonthlySummary = async (
    propertyName: string,
    sponsorEmail: string,
    monthlyRedemptions: number,
    monthlyAmount: number,
    reserveBalance: number
  ) => {
    return sendNotification("sponsor_monthly_summary", {
      property_name: propertyName,
      sponsor_email: sponsorEmail,
      monthly_redemptions: monthlyRedemptions,
      monthly_amount: monthlyAmount,
      reserve_balance: reserveBalance,
    });
  };

  // Show toast notification for UI feedback
  const showToast = (
    type: "success" | "error" | "info",
    title: string,
    description?: string
  ) => {
    if (type === "success") {
      toast.success(title, { description });
    } else if (type === "error") {
      toast.error(title, { description });
    } else {
      toast.info(title, { description });
    }
  };

  return {
    sendNotification,
    notifyRequestSubmitted,
    notifyAdminNewRequest,
    notifyRequestApproved,
    notifyRequestProcessing,
    notifyRequestCompleted,
    notifyRequestDenied,
    notifyReserveLow,
    notifySponsorMonthlySummary,
    showToast,
  };
}

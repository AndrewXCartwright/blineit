import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const LIQUIDITY_WEBHOOK_URL = Deno.env.get("LIQUIDITY_WEBHOOK_URL");
const LIQUIDITY_WEBHOOK_SECRET = Deno.env.get("LIQUIDITY_WEBHOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 
    | "request_submitted"
    | "request_approved"
    | "request_processing"
    | "request_completed"
    | "request_denied"
    | "admin_new_request"
    | "reserve_low_warning"
    | "sponsor_monthly_summary";
  data: {
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
  };
}

// Email templates
function getEmailTemplate(type: string, data: NotificationRequest["data"]): { subject: string; html: string } {
  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
  `;
  
  const cardStyles = `
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    padding: 40px;
    text-align: center;
  `;

  switch (type) {
    case "request_submitted":
      return {
        subject: `Liquidity Request Received - #${data.request_number}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="${baseStyles}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="${cardStyles}">
                <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 20px 0;">Request Received ✓</h1>
                <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Your liquidity request has been submitted and is pending review.
                </p>
                
                <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 12px; padding: 20px; margin: 0 0 20px 0; text-align: left;">
                  <p style="color: #ffd700; font-size: 14px; margin: 0 0 15px 0;">Request Details</p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Request #: <strong>${data.request_number}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Property: <strong>${data.property_name}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Tokens: <strong>${data.quantity}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Net Payout: <strong>$${data.net_payout?.toLocaleString()}</strong></p>
                </div>
                
                <p style="color: #888; font-size: 14px; margin: 20px 0 0 0;">
                  Expected processing time: 3-5 business days
                </p>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">© 2025 B-LINE-IT Inc.</p>
            </div>
          </body>
          </html>
        `,
      };

    case "request_approved":
      return {
        subject: `Liquidity Request Approved - #${data.request_number}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="${baseStyles}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="${cardStyles}">
                <h1 style="color: #22c55e; font-size: 28px; margin: 0 0 20px 0;">Request Approved! ✓</h1>
                <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Great news! Your liquidity request has been approved and is being prepared for processing.
                </p>
                
                <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 20px; margin: 0 0 20px 0; text-align: left;">
                  <p style="color: #22c55e; font-size: 14px; margin: 0 0 15px 0;">Approved Details</p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Request #: <strong>${data.request_number}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Net Payout: <strong>$${data.net_payout?.toLocaleString()}</strong></p>
                </div>
                
                <p style="color: #888; font-size: 14px; margin: 20px 0 0 0;">
                  Your payout will be processed within 1-2 business days.
                </p>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">© 2025 B-LINE-IT Inc.</p>
            </div>
          </body>
          </html>
        `,
      };

    case "request_processing":
      return {
        subject: `Your Liquidity Payout is Being Processed`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="${baseStyles}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="${cardStyles}">
                <h1 style="color: #3b82f6; font-size: 28px; margin: 0 0 20px 0;">Processing Your Payout 💸</h1>
                <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Your liquidity payout is now being processed and will be transferred to your linked bank account.
                </p>
                
                <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 20px; margin: 0 0 20px 0;">
                  <p style="color: #3b82f6; font-size: 14px; margin: 0 0 10px 0;">Transfer Amount</p>
                  <p style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0;">$${data.net_payout?.toLocaleString()}</p>
                </div>
                
                <p style="color: #888; font-size: 14px; margin: 20px 0 0 0;">
                  Expected completion: 1-2 business days
                </p>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">© 2025 B-LINE-IT Inc.</p>
            </div>
          </body>
          </html>
        `,
      };

    case "request_completed":
      return {
        subject: `Liquidity Payout Complete - $${data.net_payout?.toLocaleString()} Deposited`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="${baseStyles}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="${cardStyles}">
                <h1 style="color: #22c55e; font-size: 28px; margin: 0 0 20px 0;">Payout Complete! 🎉</h1>
                <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Your liquidity payout has been successfully deposited to your bank account.
                </p>
                
                <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 20px; margin: 0 0 20px 0;">
                  <p style="color: #22c55e; font-size: 14px; margin: 0 0 10px 0;">Amount Deposited</p>
                  <p style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0;">$${data.net_payout?.toLocaleString()}</p>
                  ${data.payout_reference ? `<p style="color: #888; font-size: 12px; margin: 10px 0 0 0;">Reference: ${data.payout_reference}</p>` : ''}
                </div>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">© 2025 B-LINE-IT Inc.</p>
            </div>
          </body>
          </html>
        `,
      };

    case "request_denied":
      return {
        subject: `Liquidity Request Update - #${data.request_number}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="${baseStyles}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="${cardStyles}">
                <h1 style="color: #ef4444; font-size: 28px; margin: 0 0 20px 0;">Request Update</h1>
                <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Unfortunately, we were unable to process your liquidity request at this time.
                </p>
                
                ${data.denial_reason ? `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin: 0 0 20px 0; text-align: left;">
                  <p style="color: #ef4444; font-size: 14px; margin: 0 0 10px 0;">Reason</p>
                  <p style="color: #ffffff; font-size: 14px; margin: 0;">${data.denial_reason}</p>
                </div>
                ` : ''}
                
                <p style="color: #e0e0e0; font-size: 14px; margin: 20px 0;">
                  <strong>Alternative:</strong> You can still list your tokens on the Secondary Market for potential buyers.
                </p>
                
                <p style="color: #888; font-size: 14px; margin: 20px 0 0 0;">
                  Questions? Contact our support team for assistance.
                </p>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">© 2025 B-LINE-IT Inc.</p>
            </div>
          </body>
          </html>
        `,
      };

    case "admin_new_request":
      return {
        subject: `New Liquidity Request - $${data.gross_value?.toLocaleString()} - ${data.property_name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="${baseStyles}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="${cardStyles}">
                <h1 style="color: #ffd700; font-size: 28px; margin: 0 0 20px 0;">New Liquidity Request</h1>
                
                <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 12px; padding: 20px; margin: 0 0 20px 0; text-align: left;">
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Request #: <strong>${data.request_number}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Investor: <strong>${data.investor_name || data.investor_email}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Property: <strong>${data.property_name}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Tokens: <strong>${data.quantity}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Gross Value: <strong>$${data.gross_value?.toLocaleString()}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Fee: <strong>$${data.fee_amount?.toLocaleString()}</strong></p>
                  <p style="color: #22c55e; font-size: 16px; margin: 10px 0 0 0;">Net Payout: <strong>$${data.net_payout?.toLocaleString()}</strong></p>
                </div>
                
                <p style="color: #888; font-size: 14px;">Review and approve this request in the admin dashboard.</p>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">© 2025 B-LINE-IT Inc.</p>
            </div>
          </body>
          </html>
        `,
      };

    case "reserve_low_warning":
      return {
        subject: `⚠️ Liquidity Reserve Below Threshold - ${data.property_name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="${baseStyles}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="${cardStyles}">
                <h1 style="color: #f59e0b; font-size: 28px; margin: 0 0 20px 0;">⚠️ Low Reserve Alert</h1>
                <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  The liquidity reserve for ${data.property_name} has fallen below the 20% threshold.
                </p>
                
                <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 20px; margin: 0 0 20px 0; text-align: left;">
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Current Balance: <strong>$${data.reserve_balance?.toLocaleString()}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Target Balance: <strong>$${data.reserve_target?.toLocaleString()}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Pending Requests: <strong>${data.pending_requests_count}</strong></p>
                </div>
                
                <p style="color: #888; font-size: 14px;">Action may be needed to replenish the reserve fund.</p>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">© 2025 B-LINE-IT Inc.</p>
            </div>
          </body>
          </html>
        `,
      };

    case "sponsor_monthly_summary":
      return {
        subject: `Monthly Liquidity Report - ${data.property_name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="${baseStyles}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="${cardStyles}">
                <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 20px 0;">Monthly Liquidity Report</h1>
                <p style="color: #e0e0e0; font-size: 16px; margin: 0 0 20px 0;">${data.property_name}</p>
                
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin: 0 0 20px 0; text-align: left;">
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Redemptions This Month: <strong>${data.monthly_redemptions}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Total Amount: <strong>$${data.monthly_amount?.toLocaleString()}</strong></p>
                  <p style="color: #ffffff; font-size: 14px; margin: 5px 0;">Reserve Balance: <strong>$${data.reserve_balance?.toLocaleString()}</strong></p>
                </div>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">© 2025 B-LINE-IT Inc.</p>
            </div>
          </body>
          </html>
        `,
      };

    default:
      return { subject: "B-LINE-IT Notification", html: "<p>You have a new notification.</p>" };
  }
}

// Webhook event mapping
function getWebhookEvent(type: string): string {
  const eventMap: Record<string, string> = {
    request_submitted: "liquidity_request.created",
    request_approved: "liquidity_request.approved",
    request_processing: "liquidity_request.processing",
    request_completed: "liquidity_request.completed",
    request_denied: "liquidity_request.denied",
    reserve_low_warning: "reserve.low_balance",
  };
  return eventMap[type] || type;
}

// Send webhook
async function sendWebhook(event: string, data: NotificationRequest["data"]) {
  if (!LIQUIDITY_WEBHOOK_URL) {
    console.log("No webhook URL configured, skipping webhook");
    return;
  }

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    data: {
      request_id: data.request_id,
      request_number: data.request_number,
      investor_id: data.investor_id,
      investor_email: data.investor_email,
      offering_id: data.offering_id,
      property_name: data.property_name,
      quantity: data.quantity,
      net_payout: data.net_payout,
      status: data.status,
    },
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add signature if secret is configured
  if (LIQUIDITY_WEBHOOK_SECRET) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(LIQUIDITY_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(JSON.stringify(payload))
    );
    headers["X-Webhook-Signature"] = btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  try {
    const response = await fetch(LIQUIDITY_WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    console.log(`Webhook sent to ${LIQUIDITY_WEBHOOK_URL}: ${response.status}`);
  } catch (error) {
    console.error("Webhook error:", error);
  }
}

// Create in-app notification
async function createInAppNotification(
  supabase: any,
  userId: string,
  type: string,
  title: string,
  message: string,
  data: Record<string, any>
) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type: `liquidity_${type}`,
    title,
    message,
    data,
    is_read: false,
    is_archived: false,
  });

  if (error) {
    console.error("Error creating in-app notification:", error);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: NotificationRequest = await req.json();
    console.log(`Processing notification type: ${type}`);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Determine recipients and send notifications
    const emailPromises: Promise<any>[] = [];
    const notificationPromises: Promise<any>[] = [];

    // Investor notifications
    if (
      ["request_submitted", "request_approved", "request_processing", "request_completed", "request_denied"].includes(type) &&
      data.investor_email
    ) {
      const template = getEmailTemplate(type, data);
      
      // Send email
      emailPromises.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "B-LINE-IT <noreply@blineit.com>",
            to: [data.investor_email],
            subject: template.subject,
            html: template.html,
          }),
        })
      );

      // Create in-app notification
      if (data.investor_id) {
        const titles: Record<string, string> = {
          request_submitted: "Liquidity Request Submitted",
          request_approved: "Liquidity Request Approved!",
          request_processing: "Payout Processing",
          request_completed: "Payout Complete!",
          request_denied: "Liquidity Request Update",
        };

        notificationPromises.push(
          createInAppNotification(
            supabase,
            data.investor_id,
            type,
            titles[type] || "Liquidity Update",
            `Request #${data.request_number} - $${data.net_payout?.toLocaleString()}`,
            { request_id: data.request_id, request_number: data.request_number }
          )
        );
      }
    }

    // Admin notifications
    if (type === "admin_new_request" && data.admin_emails?.length) {
      const template = getEmailTemplate(type, data);
      for (const email of data.admin_emails) {
        emailPromises.push(
          fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "B-LINE-IT <noreply@blineit.com>",
              to: [email],
              subject: template.subject,
              html: template.html,
            }),
          })
        );
      }
    }

    // Reserve low warning
    if (type === "reserve_low_warning" && data.admin_emails?.length) {
      const template = getEmailTemplate(type, data);
      for (const email of data.admin_emails) {
        emailPromises.push(
          fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "B-LINE-IT <noreply@blineit.com>",
              to: [email],
              subject: template.subject,
              html: template.html,
            }),
          })
        );
      }
    }

    // Sponsor monthly summary
    if (type === "sponsor_monthly_summary" && data.sponsor_email) {
      const template = getEmailTemplate(type, data);
      emailPromises.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "B-LINE-IT <noreply@blineit.com>",
            to: [data.sponsor_email],
            subject: template.subject,
            html: template.html,
          }),
        })
      );
    }

    // Send webhook for applicable events
    const webhookEvent = getWebhookEvent(type);
    if (webhookEvent) {
      await sendWebhook(webhookEvent, data);
    }

    // Wait for all emails and notifications
    await Promise.all([...emailPromises, ...notificationPromises]);

    console.log(`Notification type ${type} processed successfully`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error processing notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

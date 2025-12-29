import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReferralInviteRequest {
  toEmail: string;
  referrerName: string;
  referralCode: string;
  referralLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toEmail, referrerName, referralCode, referralLink }: ReferralInviteRequest = await req.json();

    console.log(`Sending referral invite to ${toEmail} from ${referrerName}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "B-LINE-IT <noreply@blineit.com>",
        to: [toEmail],
        subject: `${referrerName} invited you to join B-LINE-IT!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; text-align: center;">
                <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 20px 0;">You've Been Invited! 🎉</h1>
                <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                  <strong style="color: #ffd700;">${referrerName}</strong> thinks you'd love B-LINE-IT - the future of real estate investment through tokenization.
                </p>
                
                <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 12px; padding: 20px; margin: 0 0 30px 0;">
                  <p style="color: #ffd700; font-size: 14px; margin: 0 0 10px 0;">Your Referral Code</p>
                  <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px;">${referralCode}</p>
                </div>
                
                <a href="${referralLink}" style="display: inline-block; background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%); color: #1a1a2e; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Join Now & Get Started
                </a>
                
                <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                  <p style="color: #888; font-size: 14px; margin: 0 0 10px 0;">Why B-LINE-IT?</p>
                  <p style="color: #e0e0e0; font-size: 14px; line-height: 1.6; margin: 0;">
                    Invest in real estate starting from just $100. Own fractional shares of premium properties and earn passive income.
                  </p>
                </div>
              </div>
              
              <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">
                © 2025 B-LINE-IT Inc. All rights reserved.
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Referral email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending referral invite:", error);
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

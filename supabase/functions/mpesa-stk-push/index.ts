import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  orderId: string;
  accountReference: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const shortcode = Deno.env.get("MPESA_SHORTCODE");
    const passkey = Deno.env.get("MPESA_PASSKEY");
    const callbackUrl = Deno.env.get("VITE_SUPABASE_URL") + "/functions/v1/mpesa-callback";

    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      return new Response(
        JSON.stringify({ error: "M-Pesa credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { phoneNumber, amount, orderId, accountReference }: STKPushRequest = await req.json();

    // Format phone number (remove leading 0 or +254, ensure starts with 254)
    let formattedPhone = phoneNumber.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("+254")) {
      formattedPhone = formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    // Get OAuth token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Generate timestamp and password
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Make STK Push request
    const stkResponse = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.ceil(amount),
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl,
          AccountReference: accountReference || orderId,
          TransactionDesc: `Payment for order ${orderId}`,
        }),
      }
    );

    const stkData = await stkResponse.json();

    return new Response(JSON.stringify(stkData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("M-Pesa STK Push error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to initiate M-Pesa payment" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

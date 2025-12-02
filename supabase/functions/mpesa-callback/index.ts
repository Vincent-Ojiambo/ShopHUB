import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const callbackData = await req.json();
    console.log("M-Pesa callback received:", JSON.stringify(callbackData));

    const { Body } = callbackData;
    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = stkCallback;

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = metadata.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value;
      const transactionDate = metadata.find((item: any) => item.Name === "TransactionDate")?.Value;
      const phoneNumber = metadata.find((item: any) => item.Name === "PhoneNumber")?.Value;
      const amount = metadata.find((item: any) => item.Name === "Amount")?.Value;

      // Update order payment status based on CheckoutRequestID or transaction reference
      // You may need to store CheckoutRequestID when initiating STK push to match it here
      console.log("Payment successful:", {
        mpesaReceiptNumber,
        transactionDate,
        phoneNumber,
        amount,
        checkoutRequestId: CheckoutRequestID,
      });

      // Here you would typically update the order status in your database
      // This requires storing the CheckoutRequestID with the order when initiating payment
    } else {
      // Payment failed
      console.log("Payment failed:", ResultDesc);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return new Response(
      JSON.stringify({ error: "Callback processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

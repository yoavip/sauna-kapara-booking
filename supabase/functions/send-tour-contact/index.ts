import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, phone, email, message }: ContactRequest = await req.json();

    // Validate inputs
    if (!firstName || !lastName || !phone || !email || !message) {
      throw new Error("All fields are required");
    }

    const emailResponse = await resend.emails.send({
      from: "Lovable <onboarding@resend.dev>",
      to: ["dzvip@yaad.co.il"],
      subject: `פנייה חדשה מ-${firstName} ${lastName}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #b45309;">פנייה חדשה מהאתר</h1>
          <hr style="border-color: #fcd34d;" />
          <p><strong>שם:</strong> ${firstName} ${lastName}</p>
          <p><strong>טלפון:</strong> <a href="tel:${phone}">${phone}</a></p>
          <p><strong>אימייל:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border-color: #fcd34d;" />
          <h3>הודעה:</h3>
          <p style="background-color: #fef3c7; padding: 15px; border-radius: 8px;">${message}</p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-tour-contact function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

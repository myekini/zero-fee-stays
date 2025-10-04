import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { getEmailTemplate } from "./email-templates.ts";

interface EmailRequest {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📧 Email notification request received");
    
    const { to, subject, template, data }: EmailRequest = await req.json();
    
    if (!to || !template) {
      throw new Error("Email address and template are required");
    }

    const emailTemplate = getEmailTemplate(template, data);
    
    console.log(`📤 Sending ${template} email to ${to}`);
    
    const fromEmail = Deno.env.get("FROM_EMAIL") || "admin@hiddystays.com";
    const fromName = Deno.env.get("FROM_NAME") || "HiddyStays";

    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: subject || emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log("✅ Email sent successfully:", result.data?.id);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: result.data?.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    console.log(`Looking for bookings with check-in date: ${tomorrowStr}`);

    // Find bookings with check-in tomorrow
    const { data: bookings, error } = await supabaseClient
      .from("bookings")
      .select(
        `
        *,
        properties!bookings_property_id_fkey(
          id,
          title,
          address,
          location,
          wifi_network,
          wifi_password,
          parking_instructions,
          entry_instructions
        ),
        guest:profiles!bookings_guest_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        host:profiles!bookings_host_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `
      )
      .eq("check_in_date", tomorrowStr)
      .eq("status", "confirmed");

    if (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }

    console.log(
      `Found ${bookings?.length || 0} bookings with check-in tomorrow`
    );

    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No bookings found for tomorrow",
          remindersSent: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Send check-in reminders
    const reminderPromises = bookings.map(async booking => {
      try {
        const reminderData = {
          guestName:
            `${booking.guest?.first_name || ""} ${booking.guest?.last_name || ""}`.trim(),
          guestEmail: booking.guest?.email || "",
          propertyName: booking.properties?.title || "",
          checkInDate: booking.check_in_date,
          checkInTime: "3:00 PM", // Default check-in time
          propertyAddress: booking.properties?.address || "",
          hostName:
            `${booking.host?.first_name || ""} ${booking.host?.last_name || ""}`.trim(),
          hostPhone: booking.host?.phone || "",
          bookingId: booking.id,
          wifiNetwork: booking.properties?.wifi_network,
          wifiPassword: booking.properties?.wifi_password,
          parkingInstructions: booking.properties?.parking_instructions,
          entryInstructions: booking.properties?.entry_instructions,
        };

        // Call the check-in reminder API
        const response = await fetch(
          `${Deno.env.get("NEXT_PUBLIC_APP_URL")}/api/emails/checkin-reminder`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bookingId: booking.id }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to send reminder for booking ${booking.id}`);
        }

        console.log(`Check-in reminder sent for booking ${booking.id}`);
        return { bookingId: booking.id, success: true };
      } catch (error) {
        console.error(
          `Error sending reminder for booking ${booking.id}:`,
          error
        );
        return { bookingId: booking.id, success: false, error: error.message };
      }
    });

    const results = await Promise.allSettled(reminderPromises);
    const successful = results.filter(
      result => result.status === "fulfilled" && result.value.success
    );
    const failed = results.filter(
      result => result.status === "rejected" || !result.value.success
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${bookings.length} bookings`,
        remindersSent: successful.length,
        remindersFailed: failed.length,
        results: results.map(result =>
          result.status === "fulfilled"
            ? result.value
            : { success: false, error: result.reason }
        ),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-in reminder function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});


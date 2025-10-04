import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { unifiedEmailService } from "@/lib/unified-email-service";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { email, name, source = "footer" } = await request.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from("newsletter_subscriptions")
      .select("id, email, status")
      .eq("email", email.toLowerCase())
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing subscription:", checkError);
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    // If already subscribed and active, return success
    if (existingSubscription && existingSubscription.status === "active") {
      return NextResponse.json({
        success: true,
        message: "You are already subscribed to our newsletter!",
        alreadySubscribed: true,
      });
    }

    // If exists but inactive, reactivate
    if (existingSubscription && existingSubscription.status === "inactive") {
      const { error: updateError } = await supabase
        .from("newsletter_subscriptions")
        .update({
          status: "active",
          name: name || null,
          source: source,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSubscription.id);

      if (updateError) {
        console.error("Error reactivating subscription:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to reactivate subscription" },
          { status: 500 }
        );
      }

      // Send welcome email
      await unifiedEmailService.sendNewsletterWelcome({
        email: email.toLowerCase(),
        name: name || "Friend",
        source: source,
      });

      return NextResponse.json({
        success: true,
        message: "Welcome back! You have been resubscribed to our newsletter.",
        reactivated: true,
      });
    }

    // Create new subscription
    const { data: subscription, error: insertError } = await supabase
      .from("newsletter_subscriptions")
      .insert({
        email: email.toLowerCase(),
        name: name || null,
        source: source,
        status: "active",
        subscribed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating subscription:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to subscribe to newsletter" },
        { status: 500 }
      );
    }

    // Send welcome email
    const emailResult = await unifiedEmailService.sendNewsletterWelcome({
      email: email.toLowerCase(),
      name: name || "Friend",
      source: source,
    });

    if (!emailResult.success) {
      console.error("Failed to send welcome email:", emailResult.error);
      // Don't fail the subscription if email fails
    }

    // Track subscription event
    try {
      await supabase.from("newsletter_analytics").insert({
        event_type: "subscription_created",
        email: email.toLowerCase(),
        source: source,
        metadata: {
          name: name || null,
          subscription_id: subscription.id,
        },
        created_at: new Date().toISOString(),
      });
    } catch (analyticsError) {
      console.error("Error tracking subscription analytics:", analyticsError);
      // Don't fail the subscription if analytics fails
    }

    return NextResponse.json({
      success: true,
      message:
        "Successfully subscribed to our newsletter! Check your email for a welcome message.",
      subscription: {
        id: subscription.id,
        email: subscription.email,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Deactivate subscription instead of deleting
    const { error } = await supabase
      .from("newsletter_subscriptions")
      .update({
        status: "inactive",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("email", email.toLowerCase())
      .eq("status", "active");

    if (error) {
      console.error("Error unsubscribing:", error);
      return NextResponse.json(
        { success: false, error: "Failed to unsubscribe" },
        { status: 500 }
      );
    }

    // Track unsubscription event
    try {
      await supabase.from("newsletter_analytics").insert({
        event_type: "unsubscribed",
        email: email.toLowerCase(),
        metadata: {},
        created_at: new Date().toISOString(),
      });
    } catch (analyticsError) {
      console.error("Error tracking unsubscription analytics:", analyticsError);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from our newsletter.",
    });
  } catch (error) {
    console.error("Newsletter unsubscription error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Test script for booking payment status tracking
 * Tests the new payment_status column and payment workflow
 */

const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || "http://localhost:54321",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key"
);

async function testBookingPaymentStatusWorkflow() {
  console.log("🧪 Testing Booking Payment Status Workflow...\n");

  try {
    // 1. Create a test property
    console.log("1. Creating test property...");

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        title: "Test Property for Booking",
        description: "A test property to verify booking payment workflow",
        location: "Test City, Test State",
        city: "Test City",
        country: "Test Country",
        price_per_night: 100,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        host_id: "00000000-0000-0000-0000-000000000001", // Test host ID
        amenities: ["wifi", "parking"],
        approval_status: "approved",
        is_active: true,
      })
      .select()
      .single();

    if (propertyError) {
      console.error("❌ Failed to create test property:", propertyError);
      return;
    }

    console.log("✅ Test property created:", property.id);

    // 2. Create a test booking with pending payment status
    console.log("\n2. Creating test booking with pending payment status...");

    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7); // 7 days from now
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3); // 3 nights stay

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        property_id: property.id,
        guest_id: "00000000-0000-0000-0000-000000000003", // Test guest ID
        host_id: property.host_id,
        check_in_date: checkIn.toISOString().split("T")[0],
        check_out_date: checkOut.toISOString().split("T")[0],
        guests_count: 2,
        total_amount: 300, // 3 nights * $100
        currency: "USD",
        status: "pending",
        payment_status: "pending",
        guest_name: "Test Guest",
        guest_email: "test@example.com",
        guest_phone: "+1234567890",
        special_requests: "Test booking for payment workflow",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("❌ Failed to create test booking:", bookingError);
      return;
    }

    console.log("✅ Test booking created:", booking.id);
    console.log("   Payment status:", booking.payment_status);
    console.log("   Booking status:", booking.status);

    // 3. Test payment status filtering
    console.log("\n3. Testing booking filtering by payment status...");

    const { data: pendingPayments, error: filterError } = await supabase
      .from("bookings")
      .select("id, payment_status, total_amount, currency")
      .eq("payment_status", "pending");

    if (filterError) {
      console.error(
        "❌ Failed to filter bookings by payment status:",
        filterError
      );
      return;
    }

    console.log(
      "✅ Found bookings with pending payment:",
      pendingPayments.length
    );
    console.log(
      "   Pending payments:",
      pendingPayments.map(b => ({
        id: b.id,
        amount: b.total_amount,
        currency: b.currency,
      }))
    );

    // 4. Test payment processing workflow
    console.log("\n4. Testing payment processing workflow...");

    const { data: processingBooking, error: processingError } = await supabase
      .from("bookings")
      .update({
        payment_status: "processing",
        payment_intent_id: "pi_test_" + Date.now(),
        payment_method: "card",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id)
      .select()
      .single();

    if (processingError) {
      console.error(
        "❌ Failed to update payment status to processing:",
        processingError
      );
      return;
    }

    console.log("✅ Payment status updated to processing");
    console.log("   Payment intent ID:", processingBooking.payment_intent_id);
    console.log("   Payment method:", processingBooking.payment_method);

    // 5. Test successful payment
    console.log("\n5. Testing successful payment...");

    const { data: successfulBooking, error: successError } = await supabase
      .from("bookings")
      .update({
        payment_status: "succeeded",
        status: "confirmed",
        stripe_session_id: "cs_test_" + Date.now(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id)
      .select()
      .single();

    if (successError) {
      console.error(
        "❌ Failed to update payment status to succeeded:",
        successError
      );
      return;
    }

    console.log("✅ Payment succeeded");
    console.log("   Payment status:", successfulBooking.payment_status);
    console.log("   Booking status:", successfulBooking.status);
    console.log("   Stripe session ID:", successfulBooking.stripe_session_id);

    // 6. Test payment failure scenario
    console.log("\n6. Testing payment failure scenario...");

    // Create another test booking for failure testing
    const { data: failedBooking, error: failedBookingError } = await supabase
      .from("bookings")
      .insert({
        property_id: property.id,
        guest_id: "00000000-0000-0000-0000-000000000004", // Another test guest ID
        host_id: property.host_id,
        check_in_date: checkIn.toISOString().split("T")[0],
        check_out_date: checkOut.toISOString().split("T")[0],
        guests_count: 2,
        total_amount: 300,
        currency: "USD",
        status: "pending",
        payment_status: "pending",
        guest_name: "Test Guest 2",
        guest_email: "test2@example.com",
        guest_phone: "+1234567891",
        special_requests: "Test booking for payment failure",
      })
      .select()
      .single();

    if (failedBookingError) {
      console.error(
        "❌ Failed to create test booking for failure:",
        failedBookingError
      );
      return;
    }

    // Simulate payment failure
    const { data: failedPaymentBooking, error: failedError } = await supabase
      .from("bookings")
      .update({
        payment_status: "failed",
        payment_intent_id: "pi_failed_" + Date.now(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", failedBooking.id)
      .select()
      .single();

    if (failedError) {
      console.error(
        "❌ Failed to update payment status to failed:",
        failedError
      );
      return;
    }

    console.log("✅ Payment failure handled");
    console.log("   Failed booking ID:", failedPaymentBooking.id);
    console.log("   Payment status:", failedPaymentBooking.payment_status);

    // 7. Test refund workflow
    console.log("\n7. Testing refund workflow...");

    const { data: refundedBooking, error: refundError } = await supabase
      .from("bookings")
      .update({
        payment_status: "refunded",
        refund_amount: 300,
        refund_date: new Date().toISOString(),
        refund_reason: "Guest cancellation",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id)
      .select()
      .single();

    if (refundError) {
      console.error("❌ Failed to process refund:", refundError);
      return;
    }

    console.log("✅ Refund processed");
    console.log("   Refund amount:", refundedBooking.refund_amount);
    console.log("   Refund reason:", refundedBooking.refund_reason);
    console.log("   Refund date:", refundedBooking.refund_date);

    // 8. Test payment status analytics
    console.log("\n8. Testing payment status analytics...");

    const { data: paymentStats, error: statsError } = await supabase
      .from("bookings")
      .select("payment_status, total_amount")
      .in("id", [booking.id, failedBooking.id]);

    if (statsError) {
      console.error("❌ Failed to fetch payment statistics:", statsError);
      return;
    }

    const stats = paymentStats.reduce((acc, b) => {
      acc[b.payment_status] = (acc[b.payment_status] || 0) + 1;
      return acc;
    }, {});

    console.log("✅ Payment status statistics:");
    Object.entries(stats).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} bookings`);
    });

    // 9. Clean up test data
    console.log("\n9. Cleaning up test data...");

    const { error: deleteBookingsError } = await supabase
      .from("bookings")
      .delete()
      .in("id", [booking.id, failedBooking.id]);

    if (deleteBookingsError) {
      console.error("❌ Failed to delete test bookings:", deleteBookingsError);
      return;
    }

    const { error: deletePropertyError } = await supabase
      .from("properties")
      .delete()
      .eq("id", property.id);

    if (deletePropertyError) {
      console.error("❌ Failed to delete test property:", deletePropertyError);
      return;
    }

    console.log("✅ Test data cleaned up successfully");

    console.log(
      "\n🎉 Booking Payment Status Workflow Test Completed Successfully!"
    );
    console.log("\nSummary:");
    console.log("✅ Booking creation with pending payment status");
    console.log("✅ Payment status filtering");
    console.log("✅ Payment processing workflow");
    console.log("✅ Successful payment handling");
    console.log("✅ Payment failure handling");
    console.log("✅ Refund workflow");
    console.log("✅ Payment status analytics");
    console.log("✅ Test data cleanup");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
if (require.main === module) {
  testBookingPaymentStatusWorkflow()
    .then(() => {
      console.log("\n✨ All tests completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("💥 Test suite failed:", error);
      process.exit(1);
    });
}

module.exports = { testBookingPaymentStatusWorkflow };


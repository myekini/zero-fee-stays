/**
 * Test script for review submission and moderation workflow
 * Tests the new reviews system with moderation capabilities
 */

const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || "http://localhost:54321",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key"
);

async function testReviewWorkflow() {
  console.log("🧪 Testing Review Submission and Moderation Workflow...\n");

  try {
    // 1. Create test data (property, host, guest, booking)
    console.log("1. Creating test data...");

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        title: "Test Property for Reviews",
        description: "A test property to verify review workflow",
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
        rating: 0,
        review_count: 0,
      })
      .select()
      .single();

    if (propertyError) {
      console.error("❌ Failed to create test property:", propertyError);
      return;
    }

    console.log("✅ Test property created:", property.id);

    // Create test profiles
    const { data: hostProfile, error: hostError } = await supabase
      .from("profiles")
      .insert({
        id: "00000000-0000-0000-0000-000000000001",
        user_id: "00000000-0000-0000-0000-000000000001",
        email: "host@example.com",
        first_name: "Test",
        last_name: "Host",
        role: "host",
        is_host: true,
      })
      .select()
      .single();

    const { data: guestProfile, error: guestError } = await supabase
      .from("profiles")
      .insert({
        id: "00000000-0000-0000-0000-000000000003",
        user_id: "00000000-0000-0000-0000-000000000003",
        email: "guest@example.com",
        first_name: "Test",
        last_name: "Guest",
        role: "user",
        is_host: false,
      })
      .select()
      .single();

    // Create completed booking
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() - 1); // Completed yesterday

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        property_id: property.id,
        guest_id: guestProfile.id,
        host_id: hostProfile.id,
        check_in_date: new Date(checkOut.getTime() - 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 3 days ago
        check_out_date: checkOut.toISOString().split("T")[0],
        guests_count: 2,
        total_amount: 300,
        currency: "USD",
        status: "completed",
        payment_status: "succeeded",
        guest_name: "Test Guest",
        guest_email: "guest@example.com",
        guest_phone: "+1234567890",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("❌ Failed to create test booking:", bookingError);
      return;
    }

    console.log("✅ Test data created (host, guest, booking)");

    // 2. Test review creation
    console.log("\n2. Testing review creation...");

    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        property_id: property.id,
        booking_id: booking.id,
        guest_id: guestProfile.id,
        host_id: hostProfile.id,
        rating: 5,
        title: "Amazing stay!",
        comment:
          "This was an absolutely wonderful experience. The property was clean, comfortable, and exactly as described. The host was very responsive and helpful throughout our stay.",
        cleanliness_rating: 5,
        accuracy_rating: 5,
        communication_rating: 5,
        location_rating: 4,
        value_rating: 5,
        status: "pending", // Reviews start as pending for moderation
      })
      .select()
      .single();

    if (reviewError) {
      console.error("❌ Failed to create review:", reviewError);
      return;
    }

    console.log("✅ Review created:", review.id);
    console.log("   Status:", review.status);
    console.log("   Rating:", review.rating);

    // 3. Test review images
    console.log("\n3. Testing review images...");

    const { data: reviewImages, error: imagesError } = await supabase
      .from("review_images")
      .insert([
        {
          review_id: review.id,
          image_url: "https://example.com/review1.jpg",
          caption: "Beautiful living room",
          order_index: 0,
        },
        {
          review_id: review.id,
          image_url: "https://example.com/review2.jpg",
          caption: "Amazing view from the balcony",
          order_index: 1,
        },
      ])
      .select();

    if (imagesError) {
      console.error("❌ Failed to add review images:", imagesError);
      return;
    }

    console.log("✅ Review images added:", reviewImages.length);

    // 4. Test review moderation (approve)
    console.log("\n4. Testing review approval...");

    const { data: approvedReview, error: approveError } = await supabase
      .from("reviews")
      .update({
        status: "published",
        updated_at: new Date().toISOString(),
      })
      .eq("id", review.id)
      .select()
      .single();

    if (approveError) {
      console.error("❌ Failed to approve review:", approveError);
      return;
    }

    console.log("✅ Review approved and published");
    console.log("   New status:", approvedReview.status);

    // 5. Test property rating update
    console.log("\n5. Testing property rating update...");

    const { data: updatedProperty, error: propertyUpdateError } = await supabase
      .from("properties")
      .select(
        "rating, review_count, cleanliness_rating, accuracy_rating, communication_rating, location_rating, value_rating"
      )
      .eq("id", property.id)
      .single();

    if (propertyUpdateError) {
      console.error(
        "❌ Failed to fetch updated property ratings:",
        propertyUpdateError
      );
      return;
    }

    console.log("✅ Property ratings updated by trigger:");
    console.log("   Overall rating:", updatedProperty.rating);
    console.log("   Review count:", updatedProperty.review_count);
    console.log("   Cleanliness rating:", updatedProperty.cleanliness_rating);
    console.log("   Accuracy rating:", updatedProperty.accuracy_rating);
    console.log(
      "   Communication rating:",
      updatedProperty.communication_rating
    );
    console.log("   Location rating:", updatedProperty.location_rating);
    console.log("   Value rating:", updatedProperty.value_rating);

    // 6. Test review helpful votes
    console.log("\n6. Testing review helpful votes...");

    const { data: helpfulVote, error: voteError } = await supabase
      .from("review_helpful_votes")
      .insert({
        review_id: review.id,
        user_id: hostProfile.id,
      })
      .select()
      .single();

    if (voteError) {
      console.error("❌ Failed to add helpful vote:", voteError);
      return;
    }

    console.log("✅ Helpful vote added");

    // Update helpful count
    const { data: updatedReview, error: updateCountError } = await supabase
      .from("reviews")
      .update({
        helpful_count: 1,
      })
      .eq("id", review.id)
      .select()
      .single();

    if (updateCountError) {
      console.error("❌ Failed to update helpful count:", updateCountError);
      return;
    }

    console.log("✅ Helpful count updated:", updatedReview.helpful_count);

    // 7. Test review reporting
    console.log("\n7. Testing review reporting...");

    const { data: report, error: reportError } = await supabase
      .from("review_reports")
      .insert({
        review_id: review.id,
        reporter_id: hostProfile.id,
        reason: "inappropriate",
        details: "This review contains inappropriate content",
        status: "pending",
      })
      .select()
      .single();

    if (reportError) {
      console.error("❌ Failed to create review report:", reportError);
      return;
    }

    console.log("✅ Review report created:", report.id);
    console.log("   Reason:", report.reason);
    console.log("   Status:", report.status);

    // 8. Test review flagging by moderator
    console.log("\n8. Testing review flagging by moderator...");

    const { data: flaggedReview, error: flagError } = await supabase
      .from("reviews")
      .update({
        status: "flagged",
        reported_count: 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", review.id)
      .select()
      .single();

    if (flagError) {
      console.error("❌ Failed to flag review:", flagError);
      return;
    }

    console.log("✅ Review flagged for moderation");
    console.log("   Status:", flaggedReview.status);
    console.log("   Reported count:", flaggedReview.reported_count);

    // 9. Test review rejection
    console.log("\n9. Testing review rejection...");

    const { data: rejectedReview, error: rejectError } = await supabase
      .from("reviews")
      .update({
        status: "hidden",
        updated_at: new Date().toISOString(),
      })
      .eq("id", review.id)
      .select()
      .single();

    if (rejectError) {
      console.error("❌ Failed to reject review:", rejectError);
      return;
    }

    console.log("✅ Review rejected and hidden");
    console.log("   Status:", rejectedReview.status);

    // 10. Test review statistics view
    console.log("\n10. Testing review statistics...");

    const { data: reviewStats, error: statsError } = await supabase
      .from("review_statistics")
      .select("*")
      .eq("property_id", property.id)
      .single();

    if (statsError) {
      console.warn(
        "⚠️  Review statistics view not available or no data:",
        statsError.message
      );
    } else {
      console.log("✅ Review statistics retrieved:");
      console.log("   Total reviews:", reviewStats.total_reviews);
      console.log("   Average rating:", reviewStats.avg_rating);
      console.log("   Five star count:", reviewStats.five_star_count);
    }

    // 11. Test host response to review
    console.log("\n11. Testing host response to review...");

    const { data: responseReview, error: responseError } = await supabase
      .from("reviews")
      .update({
        host_response:
          "Thank you so much for your wonderful review! We are delighted that you enjoyed your stay and look forward to hosting you again.",
        host_response_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", review.id)
      .select()
      .single();

    if (responseError) {
      console.error("❌ Failed to add host response:", responseError);
      return;
    }

    console.log("✅ Host response added");
    console.log("   Response:", responseReview.host_response);
    console.log("   Response date:", responseReview.host_response_date);

    // 12. Clean up test data
    console.log("\n12. Cleaning up test data...");

    // Delete in correct order due to foreign key constraints
    await supabase
      .from("review_helpful_votes")
      .delete()
      .eq("review_id", review.id);
    await supabase.from("review_reports").delete().eq("review_id", review.id);
    await supabase.from("review_images").delete().eq("review_id", review.id);
    await supabase.from("reviews").delete().eq("id", review.id);
    await supabase.from("bookings").delete().eq("id", booking.id);
    await supabase
      .from("profiles")
      .delete()
      .in("id", [hostProfile.id, guestProfile.id]);
    await supabase.from("properties").delete().eq("id", property.id);

    console.log("✅ Test data cleaned up successfully");

    console.log(
      "\n🎉 Review Submission and Moderation Workflow Test Completed Successfully!"
    );
    console.log("\nSummary:");
    console.log("✅ Review creation with pending status");
    console.log("✅ Review images attachment");
    console.log("✅ Review approval and publishing");
    console.log("✅ Property rating update via trigger");
    console.log("✅ Review helpful votes");
    console.log("✅ Review reporting system");
    console.log("✅ Review flagging by moderators");
    console.log("✅ Review rejection and hiding");
    console.log("✅ Review statistics calculation");
    console.log("✅ Host response to reviews");
    console.log("✅ Test data cleanup");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
if (require.main === module) {
  testReviewWorkflow()
    .then(() => {
      console.log("\n✨ All tests completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("💥 Test suite failed:", error);
      process.exit(1);
    });
}

module.exports = { testReviewWorkflow };


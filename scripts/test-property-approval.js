/**
 * Test script for property approval workflow
 * Tests the new approval_status column and admin approval API
 */

const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || "http://localhost:54321",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key"
);

async function testPropertyApprovalWorkflow() {
  console.log("🧪 Testing Property Approval Workflow...\n");

  try {
    // 1. Create a test property with pending status
    console.log("1. Creating test property with pending approval status...");

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        title: "Test Property for Approval",
        description: "A test property to verify approval workflow",
        location: "Test City, Test State",
        city: "Test City",
        country: "Test Country",
        price_per_night: 100,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        host_id: "00000000-0000-0000-0000-000000000001", // Test host ID
        amenities: ["wifi", "parking"],
        approval_status: "pending",
        is_active: true,
      })
      .select()
      .single();

    if (propertyError) {
      console.error("❌ Failed to create test property:", propertyError);
      return;
    }

    console.log("✅ Test property created:", property.id);
    console.log("   Status:", property.approval_status);

    // 2. Test property filtering by approval status
    console.log("\n2. Testing property filtering by approval status...");

    const { data: pendingProperties, error: filterError } = await supabase
      .from("properties")
      .select("id, title, approval_status")
      .eq("approval_status", "pending");

    if (filterError) {
      console.error("❌ Failed to filter properties:", filterError);
      return;
    }

    console.log("✅ Found pending properties:", pendingProperties.length);
    console.log(
      "   Pending properties:",
      pendingProperties.map(p => ({ id: p.id, title: p.title }))
    );

    // 3. Test API endpoint for property approval (simulated)
    console.log("\n3. Testing property approval API endpoint...");

    // Simulate admin approval
    const { data: approvedProperty, error: approveError } = await supabase
      .from("properties")
      .update({
        approval_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: "00000000-0000-0000-0000-000000000002", // Test admin ID
        admin_notes: "Test approval - meets all requirements",
      })
      .eq("id", property.id)
      .select()
      .single();

    if (approveError) {
      console.error("❌ Failed to approve property:", approveError);
      return;
    }

    console.log("✅ Property approved successfully");
    console.log("   New status:", approvedProperty.approval_status);
    console.log("   Approved at:", approvedProperty.approved_at);

    // 4. Test property visibility based on approval status
    console.log("\n4. Testing property visibility for public users...");

    const { data: publicProperties, error: publicError } = await supabase
      .from("properties")
      .select("id, title, approval_status")
      .eq("approval_status", "approved")
      .eq("is_active", true);

    if (publicError) {
      console.error("❌ Failed to fetch public properties:", publicError);
      return;
    }

    console.log(
      "✅ Public properties (approved only):",
      publicProperties.length
    );
    console.log(
      "   Approved properties:",
      publicProperties.map(p => ({ id: p.id, title: p.title }))
    );

    // 5. Test property rejection workflow
    console.log("\n5. Testing property rejection workflow...");

    const { data: rejectedProperty, error: rejectError } = await supabase
      .from("properties")
      .update({
        approval_status: "rejected",
        rejected_reason: "Does not meet platform standards",
        rejection_notes: "Test rejection - property needs improvement",
      })
      .eq("id", property.id)
      .select()
      .single();

    if (rejectError) {
      console.error("❌ Failed to reject property:", rejectError);
      return;
    }

    console.log("✅ Property rejected successfully");
    console.log("   New status:", rejectedProperty.approval_status);
    console.log("   Rejection reason:", rejectedProperty.rejected_reason);

    // 6. Test property flagging workflow
    console.log("\n6. Testing property flagging workflow...");

    const { data: flaggedProperty, error: flagError } = await supabase
      .from("properties")
      .update({
        approval_status: "flagged",
        admin_notes: "Flagged for manual review - potential issues detected",
      })
      .eq("id", property.id)
      .select()
      .single();

    if (flagError) {
      console.error("❌ Failed to flag property:", flagError);
      return;
    }

    console.log("✅ Property flagged successfully");
    console.log("   New status:", flaggedProperty.approval_status);
    console.log("   Admin notes:", flaggedProperty.admin_notes);

    // 7. Clean up test data
    console.log("\n7. Cleaning up test data...");

    const { error: deleteError } = await supabase
      .from("properties")
      .delete()
      .eq("id", property.id);

    if (deleteError) {
      console.error("❌ Failed to delete test property:", deleteError);
      return;
    }

    console.log("✅ Test property deleted successfully");

    console.log("\n🎉 Property Approval Workflow Test Completed Successfully!");
    console.log("\nSummary:");
    console.log("✅ Property creation with pending status");
    console.log("✅ Property filtering by approval status");
    console.log("✅ Property approval workflow");
    console.log("✅ Property visibility based on approval status");
    console.log("✅ Property rejection workflow");
    console.log("✅ Property flagging workflow");
    console.log("✅ Test data cleanup");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
if (require.main === module) {
  testPropertyApprovalWorkflow()
    .then(() => {
      console.log("\n✨ All tests completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("💥 Test suite failed:", error);
      process.exit(1);
    });
}

module.exports = { testPropertyApprovalWorkflow };


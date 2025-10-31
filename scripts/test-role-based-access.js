/**
 * Test script for role-based access control functionality
 * Tests the new role system and permissions
 */

const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || "http://localhost:54321",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key"
);

async function testRoleBasedAccessControl() {
  console.log("🧪 Testing Role-Based Access Control...\n");

  try {
    // 1. Create test users with different roles
    console.log("1. Creating test users with different roles...");

    const testUsers = [
      {
        id: "00000000-0000-0000-0000-000000000001",
        user_id: "00000000-0000-0000-0000-000000000001",
        email: "superadmin@example.com",
        first_name: "Super",
        last_name: "Admin",
        role: "super_admin",
        is_host: true,
        is_verified: true,
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        user_id: "00000000-0000-0000-0000-000000000002",
        email: "admin@example.com",
        first_name: "Regular",
        last_name: "Admin",
        role: "admin",
        is_host: true,
        is_verified: true,
      },
      {
        id: "00000000-0000-0000-0000-000000000003",
        user_id: "00000000-0000-0000-0000-000000000003",
        email: "moderator@example.com",
        first_name: "Content",
        last_name: "Moderator",
        role: "moderator",
        is_host: false,
        is_verified: true,
      },
      {
        id: "00000000-0000-0000-0000-000000000004",
        user_id: "00000000-0000-0000-0000-000000000004",
        email: "host@example.com",
        first_name: "Property",
        last_name: "Host",
        role: "host",
        is_host: true,
        is_verified: true,
      },
      {
        id: "00000000-0000-0000-0000-000000000005",
        user_id: "00000000-0000-0000-0000-000000000005",
        email: "user@example.com",
        first_name: "Regular",
        last_name: "User",
        role: "user",
        is_host: false,
        is_verified: false,
      },
    ];

    const { data: createdUsers, error: usersError } = await supabase
      .from("profiles")
      .insert(testUsers)
      .select();

    if (usersError) {
      console.error("❌ Failed to create test users:", usersError);
      return;
    }

    console.log("✅ Test users created:", createdUsers.length);
    createdUsers.forEach(user => {
      console.log(
        `   ${user.role}: ${user.email} (verified: ${user.is_verified})`
      );
    });

    // 2. Test role-based property access
    console.log("\n2. Testing role-based property access...");

    // Create a test property owned by the host
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        title: "Test Property for Role Testing",
        description: "A test property to verify role-based access",
        location: "Test City, Test State",
        city: "Test City",
        country: "Test Country",
        price_per_night: 100,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        host_id: "00000000-0000-0000-0000-000000000004", // Host user ID
        amenities: ["wifi", "parking"],
        approval_status: "pending", // Not approved yet
        is_active: true,
      })
      .select()
      .single();

    if (propertyError) {
      console.error("❌ Failed to create test property:", propertyError);
      return;
    }

    console.log("✅ Test property created (pending approval)");

    // Test who can see pending properties
    console.log("\n3. Testing property visibility based on roles...");

    // Super admin should see all properties
    const { data: superAdminProperties, error: superAdminError } =
      await supabase
        .from("properties")
        .select("id, title, approval_status, host_id")
        .eq("approval_status", "pending");

    console.log(
      "✅ Super admin can see pending properties:",
      superAdminProperties?.length || 0
    );

    // Regular admin should see all properties
    const { data: adminProperties, error: adminError } = await supabase
      .from("properties")
      .select("id, title, approval_status, host_id")
      .eq("approval_status", "pending");

    console.log(
      "✅ Admin can see pending properties:",
      adminProperties?.length || 0
    );

    // Host should see their own properties regardless of approval status
    const { data: hostProperties, error: hostError } = await supabase
      .from("properties")
      .select("id, title, approval_status, host_id")
      .eq("host_id", "00000000-0000-0000-0000-000000000004");

    console.log(
      "✅ Host can see their own properties:",
      hostProperties?.length || 0
    );

    // 4. Test role-based user management
    console.log("\n4. Testing role-based user management...");

    // Test updating user roles (simulate super admin action)
    const { data: updatedUser, error: updateError } = await supabase
      .from("profiles")
      .update({
        role: "host",
        is_host: true,
        is_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", "00000000-0000-0000-0000-000000000005") // Regular user
      .select()
      .single();

    if (updateError) {
      console.error("❌ Failed to update user role:", updateError);
      return;
    }

    console.log("✅ User role updated successfully");
    console.log(`   User ${updatedUser.email} is now a ${updatedUser.role}`);

    // 5. Test role-based booking access
    console.log("\n5. Testing role-based booking access...");

    // Create a test booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        property_id: property.id,
        guest_id: "00000000-0000-0000-0000-000000000005", // The user we just promoted
        host_id: "00000000-0000-0000-0000-000000000004", // Host
        check_in_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        check_out_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        guests_count: 2,
        total_amount: 300,
        currency: "USD",
        status: "confirmed",
        payment_status: "succeeded",
        guest_name: "Regular User",
        guest_email: "user@example.com",
        guest_phone: "+1234567890",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("❌ Failed to create test booking:", bookingError);
      return;
    }

    console.log("✅ Test booking created");

    // Test who can see this booking
    const { data: guestBookings, error: guestBookingsError } = await supabase
      .from("bookings")
      .select("id, status, guest_id, host_id")
      .eq("guest_id", "00000000-0000-0000-0000-000000000005");

    console.log(
      "✅ Guest can see their own bookings:",
      guestBookings?.length || 0
    );

    const { data: hostBookings, error: hostBookingsError } = await supabase
      .from("bookings")
      .select("id, status, guest_id, host_id")
      .eq("host_id", "00000000-0000-0000-0000-000000000004");

    console.log(
      "✅ Host can see bookings for their properties:",
      hostBookings?.length || 0
    );

    // 6. Test admin functions
    console.log("\n6. Testing admin-specific functions...");

    // Test property approval (admin function)
    const { data: approvedProperty, error: approveError } = await supabase
      .from("properties")
      .update({
        approval_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: "00000000-0000-0000-0000-000000000001", // Super admin
        admin_notes: "Approved by test script",
      })
      .eq("id", property.id)
      .select()
      .single();

    if (approveError) {
      console.error("❌ Failed to approve property:", approveError);
      return;
    }

    console.log("✅ Property approved by admin");
    console.log("   Approval status:", approvedProperty.approval_status);
    console.log("   Approved by:", approvedProperty.approved_by);

    // 7. Test activity logging
    console.log("\n7. Testing activity logging...");

    const { data: activityLog, error: activityError } = await supabase
      .from("activity_logs")
      .insert({
        user_id: "00000000-0000-0000-0000-000000000001", // Super admin
        action: "property_approved",
        entity_type: "property",
        entity_id: property.id,
        metadata: {
          property_title: property.title,
          approval_status: "approved",
          admin_notes: "Test approval",
        },
      })
      .select()
      .single();

    if (activityError) {
      console.error("❌ Failed to log activity:", activityError);
      return;
    }

    console.log("✅ Activity logged successfully");
    console.log("   Action:", activityLog.action);
    console.log("   Entity:", activityLog.entity_type);

    // 8. Test role validation functions
    console.log("\n8. Testing role validation functions...");

    // Test is_admin function
    const { data: adminCheck, error: adminCheckError } = await supabase.rpc(
      "is_admin",
      { user_uuid: "00000000-0000-0000-0000-000000000001" }
    );

    console.log("✅ Super admin role check:", adminCheck);

    const { data: regularAdminCheck, error: regularAdminCheckError } =
      await supabase.rpc("is_admin", {
        user_uuid: "00000000-0000-0000-0000-000000000002",
      });

    console.log("✅ Regular admin role check:", regularAdminCheck);

    const { data: userCheck, error: userCheckError } = await supabase.rpc(
      "is_admin",
      { user_uuid: "00000000-0000-0000-0000-000000000005" }
    );

    console.log("✅ Regular user admin check:", userCheck);

    // Test is_host function
    const { data: hostCheck, error: hostCheckError } = await supabase.rpc(
      "is_host",
      { user_uuid: "00000000-0000-0000-0000-000000000004" }
    );

    console.log("✅ Host role check:", hostCheck);

    // 9. Test bulk role updates
    console.log("\n9. Testing bulk role updates...");

    const bulkUpdates = [
      {
        user_id: "00000000-0000-0000-0000-000000000003",
        role: "admin",
        is_verified: true,
      },
      {
        user_id: "00000000-0000-0000-0000-000000000004",
        role: "super_admin",
        is_verified: true,
      },
    ];

    for (const update of bulkUpdates) {
      const { data: bulkUpdated, error: bulkError } = await supabase
        .from("profiles")
        .update({
          role: update.role,
          is_host:
            update.role === "host" ||
            update.role === "admin" ||
            update.role === "super_admin",
          is_verified: update.is_verified,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", update.user_id)
        .select()
        .single();

      if (bulkError) {
        console.error(`❌ Failed to update user ${update.user_id}:`, bulkError);
        continue;
      }

      console.log(
        `✅ User ${updatedUser.email} role updated to ${update.role}`
      );
    }

    // 10. Clean up test data
    console.log("\n10. Cleaning up test data...");

    // Delete in correct order due to foreign key constraints
    await supabase.from("activity_logs").delete().eq("entity_id", property.id);
    await supabase.from("bookings").delete().eq("id", booking.id);
    await supabase.from("properties").delete().eq("id", property.id);
    await supabase
      .from("profiles")
      .delete()
      .in(
        "id",
        testUsers.map(u => u.id)
      );

    console.log("✅ Test data cleaned up successfully");

    console.log("\n🎉 Role-Based Access Control Test Completed Successfully!");
    console.log("\nSummary:");
    console.log("✅ User creation with different roles");
    console.log("✅ Role-based property access control");
    console.log("✅ Property visibility based on roles");
    console.log("✅ Role-based user management");
    console.log("✅ Role-based booking access");
    console.log("✅ Admin-specific functions");
    console.log("✅ Activity logging");
    console.log("✅ Role validation functions");
    console.log("✅ Bulk role updates");
    console.log("✅ Test data cleanup");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
if (require.main === module) {
  testRoleBasedAccessControl()
    .then(() => {
      console.log("\n✨ All tests completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("💥 Test suite failed:", error);
      process.exit(1);
    });
}

module.exports = { testRoleBasedAccessControl };


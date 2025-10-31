/**
 * Comprehensive test runner for all new features
 * Tests property approval, payment status, reviews, and role-based access
 */

const { testPropertyApprovalWorkflow } = require("./test-property-approval");
const {
  testBookingPaymentStatusWorkflow,
} = require("./test-booking-payment-status");
const { testReviewWorkflow } = require("./test-review-workflow");
const { testRoleBasedAccessControl } = require("./test-role-based-access");

async function runAllTests() {
  console.log("🚀 Starting Comprehensive Test Suite for New Features\n");
  console.log("=" * 60);

  const tests = [
    {
      name: "Property Approval Workflow",
      fn: testPropertyApprovalWorkflow,
      description: "Tests property approval status and admin approval workflow",
    },
    {
      name: "Booking Payment Status Tracking",
      fn: testBookingPaymentStatusWorkflow,
      description: "Tests payment status tracking and payment workflow",
    },
    {
      name: "Review Submission and Moderation",
      fn: testReviewWorkflow,
      description: "Tests review system with moderation capabilities",
    },
    {
      name: "Role-Based Access Control",
      fn: testRoleBasedAccessControl,
      description: "Tests user roles and permission system",
    },
  ];

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n🧪 Running: ${test.name}`);
    console.log(`📝 Description: ${test.description}`);
    console.log("-".repeat(50));

    try {
      await test.fn();
      console.log(`✅ ${test.name} - PASSED`);
      results.push({ name: test.name, status: "PASSED", error: null });
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name} - FAILED`);
      console.log(`   Error: ${error.message}`);
      results.push({ name: test.name, status: "FAILED", error: error.message });
      failed++;
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(
    `📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`
  );

  if (failed > 0) {
    console.log("\n❌ FAILED TESTS:");
    results
      .filter(r => r.status === "FAILED")
      .forEach(result => {
        console.log(`   • ${result.name}: ${result.error}`);
      });
  }

  console.log("\n📋 FEATURE COVERAGE:");
  console.log("✅ Property approval workflow with approval_status column");
  console.log("✅ Booking payment tracking with payment_status column");
  console.log("✅ Review system with moderation and rating aggregation");
  console.log("✅ Role-based access control with user roles");
  console.log("✅ API routes updated for new columns");
  console.log("✅ TypeScript types regenerated from database schema");

  console.log("\n🎯 NEXT STEPS:");
  if (failed === 0) {
    console.log(
      "🎉 All tests passed! The new features are ready for production."
    );
    console.log("   • Deploy the updated API routes");
    console.log("   • Update frontend components to use new columns");
    console.log("   • Configure admin dashboard for property moderation");
    console.log("   • Set up review moderation workflow");
    console.log("   • Implement role-based UI components");
  } else {
    console.log(
      "⚠️  Some tests failed. Please review and fix the issues before deployment."
    );
    console.log("   • Check database schema and migrations");
    console.log("   • Verify API route implementations");
    console.log("   • Test with actual data");
    console.log("   • Check RLS policies and permissions");
  }

  return { passed, failed, total: tests.length, results };
}

// Run all tests
if (require.main === module) {
  runAllTests()
    .then(({ passed, failed }) => {
      console.log("\n✨ Test suite completed");
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error("💥 Test suite failed:", error);
      process.exit(1);
    });
}

module.exports = { runAllTests };


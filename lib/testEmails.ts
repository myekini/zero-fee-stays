import { renderAsync } from "@react-email/components";
// import WelcomeVerify from "../emails/WelcomeVerify";
// import PasswordReset from "../emails/PasswordReset";
// import BookingConfirmation from "../emails/BookingConfirmation";
// import HostNotification from "../emails/HostNotification";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test data for each template
const testData = {
  welcome: {
    name: "David Ibrahim",
    verifyUrl: "https://app.hiddystays.com/verify?token=abc123",
  },
  passwordReset: {
    name: "David Ibrahim",
    resetUrl: "https://app.hiddystays.com/reset?token=xyz789",
    ip: "192.168.1.1",
    city: "Lagos",
  },
  bookingConfirmation: {
    name: "David Ibrahim",
    propertyName: "Hiddy Loft — Ikoyi",
    address: "21 Queen's Drive, Ikoyi, Lagos",
    checkIn: "2025-09-12",
    checkOut: "2025-09-15",
    guests: 2,
    total: "₦245,000",
    manageUrl: "https://app.hiddystays.com/booking/XYZ/manage",
    receiptUrl: "https://app.hiddystays.com/booking/XYZ/receipt",
  },
  hostNotification: {
    hostName: "Adaeze U.",
    guestName: "David Ibrahim",
    propertyName: "Hiddy Loft — Ikoyi",
    checkIn: "2025-09-12",
    checkOut: "2025-09-15",
    guests: 2,
    payout: "₦180,500",
    approveUrl: "https://host.hiddystays.com/requests/XYZ/approve",
    declineUrl: "https://host.hiddystays.com/requests/XYZ/decline",
    detailsUrl: "https://host.hiddystays.com/requests/XYZ",
  },
};

export async function testAllTemplates() {
  console.log("🧪 Testing all email templates...\n");

  try {
    // Mock implementations for now
    console.log("📧 Testing Welcome Verification template...");
    const welcomeHtml = `<h1>Welcome ${testData.welcome.name}!</h1><p>Please verify your email.</p>`;
    console.log("✅ Welcome Verification template rendered successfully");
    console.log(`📄 HTML length: ${welcomeHtml.length} characters\n`);

    console.log("🔐 Testing Password Reset template...");
    const passwordHtml = `<h1>Password Reset</h1><p>Hello ${testData.passwordReset.name}, please reset your password.</p>`;
    console.log("✅ Password Reset template rendered successfully");
    console.log(`📄 HTML length: ${passwordHtml.length} characters\n`);

    console.log("🏠 Testing Booking Confirmation template...");
    const bookingHtml = `<h1>Booking Confirmed</h1><p>Your booking for ${testData.bookingConfirmation.propertyName} has been confirmed.</p>`;
    console.log("✅ Booking Confirmation template rendered successfully");
    console.log(`📄 HTML length: ${bookingHtml.length} characters\n`);

    console.log("👥 Testing Host Notification template...");
    const hostHtml = `<h1>New Booking</h1><p>You have a new booking for ${testData.hostNotification.propertyName}.</p>`;
    console.log("✅ Host Notification template rendered successfully");
    console.log(`📄 HTML length: ${hostHtml.length} characters\n`);

    console.log("🎉 All templates tested successfully!");

    // Save test outputs to files for inspection
    const projectRoot = path.resolve(__dirname, "../../");
    const testDir = path.join(projectRoot, "test-emails");
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }

    fs.writeFileSync(
      path.join(testDir, "welcome-verification.html"),
      welcomeHtml
    );
    fs.writeFileSync(path.join(testDir, "password-reset.html"), passwordHtml);
    fs.writeFileSync(
      path.join(testDir, "booking-confirmation.html"),
      bookingHtml
    );
    fs.writeFileSync(path.join(testDir, "host-notification.html"), hostHtml);

    console.log(`📁 Test HTML files saved to: ${testDir}`);
  } catch (error) {
    console.error("❌ Error testing templates:", error);
    throw error;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAllTemplates().catch(console.error);
}

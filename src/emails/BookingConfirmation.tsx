import { Section, Text, Heading, Hr } from "@react-email/components";
import BaseLayout from "./components/BaseLayout";
import { Button } from "./components/Button";
import { InfoRow } from "./components/InfoRow";
import { StatusRail } from "./components/StatusRail";

export default function BookingConfirmation({
  name = "Guest",
  propertyName = "Hiddy Loft",
  address = "123 Ocean View, Lagos",
  checkIn = "2025-09-01",
  checkOut = "2025-09-05",
  guests = 2,
  total = "$420",
  manageUrl = "#",
  receiptUrl = "#",
}) {
  return (
    <BaseLayout preview="You're all set. Here are your stay details and next steps.">
      <Section style={{ background: "#FFF7ED", padding: 24 }}>
        <Heading as="h2" style={{ margin: 0, color: "#0F172A" }}>
          Hooray! Your booking is confirmed.
        </Heading>
        <div style={{ marginTop: 12 }}>
          <StatusRail
            steps={["Confirmed", "Preparing", "Stay"]}
            activeIndex={0}
          />
        </div>
      </Section>

      <Section style={{ padding: 24 }}>
        <Heading
          as="h3"
          style={{ margin: "0 0 8px", fontSize: 18, color: "#0F172A" }}
        >
          {propertyName}
        </Heading>
        <Text style={{ color: "#64748B", margin: 0 }}>{address}</Text>
        <div
          style={{
            marginTop: 16,
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <InfoRow label="Guest" value={name} />
          <InfoRow label="Check‑in" value={checkIn} />
          <InfoRow label="Check‑out" value={checkOut} />
          <InfoRow label="Guests" value={String(guests)} />
          <Hr style={{ borderColor: "#E2E8F0" }} />
          <InfoRow label="Total Paid" value={total} />
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <Button href={manageUrl}>View / Manage Booking</Button>
          <a href={receiptUrl} style={{ color: "#0F172A", fontWeight: 600 }}>
            Download Receipt
          </a>
        </div>
        <Text style={{ color: "#64748B", fontSize: 12, marginTop: 12 }}>
          Need help? Reply to this email or contact{" "}
          <a href="mailto:support@hiddystays.com">support@hiddystays.com</a>.
        </Text>
      </Section>
    </BaseLayout>
  );
}

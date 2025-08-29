import { Section, Text, Heading } from "@react-email/components";
import BaseLayout from "./components/BaseLayout";
import { Button } from "./components/Button";
import { InfoRow } from "./components/InfoRow";

export default function HostNotification({
  hostName = "",
  guestName = "",
  propertyName = "",
  checkIn = "",
  checkOut = "",
  guests = 1,
  payout = "$0.00",
  approveUrl = "#",
  declineUrl = "#",
  detailsUrl = "#",
}) {
  return (
    <BaseLayout preview="Review guest details and approve/decline from your inbox.">
      <Section style={{ padding: 24 }}>
        <Heading as="h2" style={{ color: "#0F172A", fontSize: 22, margin: 0 }}>
          New booking request
        </Heading>
        <Text style={{ color: "#64748B" }}>
          Hi {hostName}, you have a new request for{" "}
          <strong>{propertyName}</strong>.
        </Text>
        <div
          style={{
            marginTop: 8,
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <InfoRow label="Guest" value={guestName} />
          <InfoRow label="Dates" value={`${checkIn} → ${checkOut}`} />
          <InfoRow label="Guests" value={String(guests)} />
          <InfoRow label="Estimated payout" value={payout} />
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <Button href={approveUrl}>Approve</Button>
          <a
            href={declineUrl}
            style={{
              display: "inline-block",
              padding: "12px 20px",
              borderRadius: 9999,
              textDecoration: "none",
              border: "1px solid #E2E8F0",
              color: "#0F172A",
              fontWeight: 600,
            }}
          >
            Decline
          </a>
          <a
            href={detailsUrl}
            style={{ color: "#0F172A", fontWeight: 600, alignSelf: "center" }}
          >
            View details
          </a>
        </div>
      </Section>
    </BaseLayout>
  );
}

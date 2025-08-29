import { Section, Text, Heading } from "@react-email/components";
import BaseLayout from "./components/BaseLayout";
import { Button } from "./components/Button";

export default function WelcomeVerify({ name = "Guest", verifyUrl = "#" }) {
  return (
    <BaseLayout preview="Welcome in! Confirm your email to start booking.">
      <Section style={{ padding: 24 }}>
        <Heading as="h2" style={{ color: "#0F172A", fontSize: 24, margin: 0 }}>
          Welcome to HiddyStays
        </Heading>
        <Text style={{ color: "#64748B" }}>
          Hi {name}, thanks for signing up. Please verify your email to secure
          your account and start booking premium stays.
        </Text>
        <div style={{ marginTop: 16 }}>
          <Button href={verifyUrl}>Verify Email</Button>
        </div>
        <Text style={{ fontSize: 12, color: "#64748B", marginTop: 16 }}>
          If the button doesn't work, paste this link into your browser:{" "}
          {verifyUrl}
        </Text>
      </Section>
    </BaseLayout>
  );
}

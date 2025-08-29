import { Section, Text, Heading } from "@react-email/components";
import BaseLayout from "./components/BaseLayout";
import { Button } from "./components/Button";

export default function PasswordReset({
  name = "Guest",
  resetUrl = "#",
  ip = "",
  city = "",
}) {
  return (
    <BaseLayout preview="Here's your secure password reset link (valid for 30 minutes).">
      <Section style={{ padding: 24 }}>
        <Heading as="h2" style={{ color: "#0F172A", fontSize: 22, margin: 0 }}>
          Password reset requested
        </Heading>
        <Text style={{ color: "#64748B" }}>
          Hi {name}, we received a request to reset your password. If this was
          you, click the button below. This link expires in 30 minutes.
        </Text>
        <div style={{ marginTop: 16 }}>
          <Button href={resetUrl}>Reset Password</Button>
        </div>
        {(ip || city) && (
          <Text style={{ color: "#94A3B8", fontSize: 12, marginTop: 12 }}>
            Security note: request detected from {city} {ip && `(${ip})`}.
          </Text>
        )}
        <Text style={{ color: "#64748B", fontSize: 12 }}>
          If you didn't request this, you can ignore this email or contact
          support.
        </Text>
      </Section>
    </BaseLayout>
  );
}
